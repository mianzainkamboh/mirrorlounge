'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SimpleDashboard() {
  console.log('🏠 SimpleDashboard: Component function called');
  
  const [testState] = useState('Simple dashboard loaded');
  
  console.log('🏠 SimpleDashboard: After useState, testState:', testState);
  
  // Test useEffect to see if it executes after server restart
  useEffect(() => {
    console.log('🏠 SimpleDashboard: useEffect executed! This means hydration is working.');
  }, []);
  
  console.log('🏠 SimpleDashboard: After useEffect definition');
  const stats = [
    { name: 'Total Services', value: '12', change: '8 active', color: 'pink' },
    { name: 'Categories', value: '5', change: '4 with services', color: 'blue' },
    { name: 'Active Offers', value: '3', change: 'AED 1500 total value', color: 'purple' },
  ];

  const quickActions = [
    { name: 'Add Service', href: '/services', icon: '✂️' },
    { name: 'Add Category', href: '/catagories', icon: '📂' },
    { name: 'Create Offer', href: '/offers', icon: '🏷️' },
  ];

  console.log('🏠 SimpleDashboard: About to render JSX');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Simple Dashboard
          </h1>
          <p className="text-gray-600">
            Test page without authentication or Firebase - {testState}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500 flex items-center justify-center`}>
                  <span className="text-white text-xl">📊</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors"
              >
                <span className="text-2xl mr-3">{action.icon}</span>
                <span className="font-medium text-gray-900">{action.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Test Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Test Information</h3>
          <p className="text-blue-800 text-sm">
            This is a simplified dashboard without authentication or Firebase subscriptions.
            If this loads properly, the issue is with useEffect hooks not executing.
          </p>
        </div>
      </div>
    </div>
  );
}