'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-3xl"></div>
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="flex items-center justify-center space-x-1 mb-4">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-pink-600 font-semibold text-lg">Loading Mirror Salon...</p>
          <p className="text-pink-400 text-sm mt-2">Please wait while we prepare your dashboard</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  // Show protected content
  return <>{children}</>;
}