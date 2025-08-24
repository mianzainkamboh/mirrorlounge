'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getUserRole, setUserRole as createUserRole, UserRole } from '@/lib/auth';
import { auth, initializeFirebase } from '@/lib/firebase';

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
    // Check if Firebase auth is available
    if (typeof window === 'undefined') {
      console.warn('Running on server side, skipping auth initialization');
      setLoading(false);
      return;
    }

    // Ensure Firebase is initialized
    initializeFirebase();
    
    // Wait for Firebase initialization with timeout
    const initializeAuth = () => {
      console.log('Auth object:', auth);
      console.log('Auth type:', typeof auth);
      
      if (!auth) {
        console.warn('Firebase auth not yet initialized, retrying...');
        return false;
      }
      
      console.log('Firebase auth initialized successfully, setting up listener');
      return true;
    };
    
    // Try immediate initialization
    if (initializeAuth()) {
      setupAuthListener();
      return;
    }
    
    // If not ready, wait with timeout
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 500; // 500ms
    
    const retryTimer = setInterval(() => {
      retryCount++;
      
      if (initializeAuth()) {
        clearInterval(retryTimer);
        setupAuthListener();
      } else if (retryCount >= maxRetries) {
        clearInterval(retryTimer);
        console.error('Firebase auth failed to initialize after', maxRetries, 'retries');
        setLoading(false);
      }
    }, retryInterval);
    
    return () => {
      clearInterval(retryTimer);
    };
    
    function setupAuthListener() {

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
    }
  }, []);

  const isAdmin = userRole?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, userRole, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};