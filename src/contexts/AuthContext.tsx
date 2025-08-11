'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getUserRole, setUserRole as createUserRole, UserRole } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);

      if (user) {
        // Get user role from Firestore
        let role = await getUserRole(user.uid);

        // If user doesn't exist in Firestore, create them with appropriate role
        if (!role && user.email) {
          // Make ahmadxeikh786@gmail.com admin by default, others are users
          const defaultRole = user.email === 'ahmadxeikh786@gmail.com' ? 'admin' : 'user';
          console.log('Creating new user with role:', defaultRole, 'for email:', user.email);
          await createUserRole(user.uid, user.email, defaultRole, user.displayName || undefined);
          role = await getUserRole(user.uid);
        }

        // Special case: Always ensure ahmadxeikh786@gmail.com is admin
        if (user.email === 'ahmadxeikh786@gmail.com') {
          if (!role || role.role !== 'admin') {
            console.log('Updating ahmadxeikh786@gmail.com to admin role');
            await createUserRole(user.uid, user.email, 'admin', user.displayName || undefined);
            role = await getUserRole(user.uid);
            console.log('Role updated to:', role);
          } else {
            console.log('ahmadxeikh786@gmail.com already has admin role');
          }
        }

        console.log('Final user role:', role);

        // Temporary: Add global function to manually update admin role
        if (typeof window !== 'undefined') {
          (window as unknown as { makeAdmin: (email: string) => Promise<UserRole | null> }).makeAdmin = async (email: string) => {
            if (user && user.email === email) {
              console.log('Manually updating user to admin:', email);
              await createUserRole(user.uid, user.email, 'admin', user.displayName || undefined);
              const updatedRole = await getUserRole(user.uid);
              setUserRole(updatedRole);
              console.log('Updated role:', updatedRole);
              return updatedRole;
            } else {
              console.log('User not found or email mismatch');
              return null;
            }
          };
        }

        setUserRole(role);
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = userRole?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, userRole, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};