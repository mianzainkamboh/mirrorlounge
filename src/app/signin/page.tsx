'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, sendPasswordReset } from '@/lib/auth';
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react';

// Custom elegant loader component
const ElegantLoader = () => (
  <div className="flex items-center justify-center space-x-1">
    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { user, error: authError } = await signInWithEmail(email, password);

    if (user) {
      router.push('/');
    } else {
      setError(authError || 'Failed to sign in');
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await sendPasswordReset(email);

    if (error) {
      setError(error);
    } else {
      setMessage('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    }

    setLoading(false);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center p-2 sm:p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Compact Sign In Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(233,30,99,0.15)] p-4 sm:p-6">
          {/* Compact Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1
              className="text-lg sm:text-xl font-bold text-pink-600 mb-1"
              style={{
                fontFamily: 'var(--font-dancing-script), "Brush Script MT", cursive',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}
            >
              Mirror Salon
            </h1>
            <p className="text-gray-600 text-xs">Admin Panel Access</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs sm:text-sm text-center">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-xs sm:text-sm text-center">{message}</p>
            </div>
          )}

          {/* Compact Forms */}
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border border-pink-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white/50 text-xs"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 px-3 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-1 focus:ring-pink-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 text-xs"
              >
                {loading ? (
                  <>
                    <ElegantLoader />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3 h-3" />
                    <span>Send Reset Email</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-pink-600 hover:text-pink-700 text-xs font-medium transition-colors py-1"
              >
                ← Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border border-pink-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white/50 text-xs"
                  placeholder="admin@mirrorsalon.com"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 pr-8 border border-pink-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white/50 text-xs"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 px-3 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-1 focus:ring-pink-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 text-xs"
              >
                {loading ? (
                  <>
                    <ElegantLoader />
                    <span className="ml-2">Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3 h-3" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-pink-600 hover:text-pink-700 text-xs font-medium transition-colors py-1"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          )}

          {/* Compact Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Admin access only • Secure authentication
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-3 text-center space-y-2">
          <p className="text-xs text-gray-600">
            Need access? Contact your system administrator
          </p>

          {/* Create Admin Button */}
          {/* <button
            onClick={handleCreateAdmin}
            disabled={loading}
            className="text-xs text-pink-600 hover:text-pink-700 font-medium transition-colors underline disabled:opacity-50"
          >
            Create Admin User (First Time Setup)
          </button> */}
        </div>
      </div>
    </div>
  );
}