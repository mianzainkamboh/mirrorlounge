'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Category,
  Service,
  Branch,
  Offer,
  subscribeToCategoriesChanges,
  subscribeToServicesChanges,
  subscribeToBranchesChanges,
  subscribeToOffersChanges
} from '@/lib/firebaseServicesNoStorage';

export default function Dashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates for all collections
  useEffect(() => {
    let loadedCount = 0;
    const totalCollections = 4;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalCollections) {
        setLoading(false);
      }
    };

    // Subscribe to categories
    const unsubscribeCategories = subscribeToCategoriesChanges(
      (updatedCategories) => {
        setCategories(updatedCategories);
        checkAllLoaded();
      },
      (error) => {
        console.error('Categories error:', error);
        checkAllLoaded();
      }
    );

    // Subscribe to services
    const unsubscribeServices = subscribeToServicesChanges(
      (updatedServices) => {
        setServices(updatedServices);
        checkAllLoaded();
      },
      (error) => {
        console.error('Services error:', error);
        checkAllLoaded();
      }
    );

    // Subscribe to branches
    const unsubscribeBranches = subscribeToBranchesChanges(
      (updatedBranches) => {
        setBranches(updatedBranches);
        checkAllLoaded();
      },
      (error) => {
        console.error('Branches error:', error);
        checkAllLoaded();
      }
    );

    // Subscribe to offers
    const unsubscribeOffers = subscribeToOffersChanges(
      (updatedOffers) => {
        setOffers(updatedOffers);
        checkAllLoaded();
      },
      (error) => {
        console.error('Offers error:', error);
        checkAllLoaded();
      }
    );

    return () => {
      unsubscribeCategories();
      unsubscribeServices();
      unsubscribeBranches();
      unsubscribeOffers();
    };
  }, []);

  // Calculate real-time statistics
  const menServices = services.filter(service => service.category.toLowerCase().includes('men'));
  const womenServices = services.filter(service => service.category.toLowerCase().includes('women'));
  const unisexServices = services.filter(service => service.category.toLowerCase().includes('unisex'));
  const activeServices = services.filter(service => service.isActive);
  const activeBranches = branches.filter(branch => branch.isActive);
  const activeOffers = offers.filter(offer => offer.isActive && new Date(offer.validTo) >= new Date());

  // Calculate total revenue from services (example calculation)
  const totalRevenue = services.reduce((sum, service) => sum + (service.price || 0), 0);

  const stats = [
    { 
      name: 'Total Services', 
      value: services.length.toString(), 
      change: `${activeServices.length} active`,
      color: 'pink'
    },
    { 
      name: 'Categories', 
      value: categories.length.toString(), 
      change: `${categories.filter(cat => cat.serviceCount > 0).length} with services`,
      color: 'blue'
    },
    // { 
    //   name: 'Branches', 
    //   value: branches.length.toString(), 
    //   change: `${activeBranches.length} active`,
    //   color: 'green'
    // },
    { 
      name: 'Active Offers', 
      value: activeOffers.length.toString(), 
      change: `AED ${totalRevenue.toFixed(0)} total value`,
      color: 'purple'
    },
  ];

  // Get recent activity (last 5 items sorted by creation date)
  const recentActivity = [
    ...services.slice(0, 2).map(service => ({
      action: 'Service added',
      item: service.name,
      time: service.createdAt ? getTimeAgo(service.createdAt.toDate()) : 'Recently',
      type: 'service'
    })),
    ...categories.slice(0, 2).map(category => ({
      action: 'Category added',
      item: category.name,
      time: category.createdAt ? getTimeAgo(category.createdAt.toDate()) : 'Recently',
      type: 'category'
    })),
    ...branches.slice(0, 1).map(branch => ({
      action: 'Branch added',
      item: branch.name,
      time: branch.createdAt ? getTimeAgo(branch.createdAt.toDate()) : 'Recently',
      type: 'branch'
    }))
  ].slice(0, 5);

  const quickActions = [
    { name: 'Add Service', href: '/services', icon: '✂️' },
    { name: 'Add Category', href: '/catagories', icon: '📂' },
    // { name: 'Add Branch', href: '/branches', icon: '🏢' },
    { name: 'Create Offer', href: '/offers', icon: '🏷️' },
  ];

  // Helper function to calculate time ago
  function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  if (loading) {
    return (
      <div className="p-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <span className="ml-3 text-pink-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="max-w-5xl mx-auto">
        {/* Compact Header */}
        <div className="mb-4">
          <h1 className="text-lg font-medium text-pink-600 mb-1">Dashboard</h1>
          <p className="text-xs text-pink-500">Real-time salon management overview</p>
        </div>

        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-2xl p-3 shadow-[0_8px_30px_rgb(233,30,99,0.15)] transition-all duration-300 hover:shadow-[0_12px_40px_rgb(233,30,99,0.25)]">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-6 h-6 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <div className={`w-2 h-2 bg-${stat.color}-500 rounded-full`}></div>
                </div>
                <div className="text-xs text-pink-500 font-medium">{stat.change}</div>
              </div>
              <div className="text-xs font-medium text-pink-600 mb-1">{stat.name}</div>
              <div className="text-lg font-semibold text-pink-700">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Real-time Services Overview */}
          <div>
            <div className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-2xl p-4 shadow-[0_8px_30px_rgb(233,30,99,0.15)] transition-all duration-300 hover:shadow-[0_12px_40px_rgb(233,30,99,0.25)]">
              <h2 className="text-sm font-semibold text-pink-700 mb-3">Services by Gender</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium text-blue-700">Men Services</span>
                  </div>
                  <span className="text-sm font-bold text-blue-700">{menServices.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-pink-50/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <span className="text-xs font-medium text-pink-700">Women Services</span>
                  </div>
                  <span className="text-sm font-bold text-pink-700">{womenServices.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-xs font-medium text-purple-700">Unisex Services</span>
                  </div>
                  <span className="text-sm font-bold text-purple-700">{unisexServices.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Recent Activity */}
          <div>
            <div className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-2xl p-4 shadow-[0_8px_30px_rgb(233,30,99,0.15)] transition-all duration-300 hover:shadow-[0_12px_40px_rgb(233,30,99,0.25)]">
              <h2 className="text-sm font-semibold text-pink-700 mb-3">Recent Activity</h2>
              <div className="space-y-2">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-pink-50/50 transition-all duration-200">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-pink-700 font-medium">
                          {activity.action}: <span className="text-pink-600">{activity.item}</span>
                        </p>
                        <p className="text-xs text-pink-500 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-pink-500">No recent activity</p>
                    <p className="text-xs text-pink-400 mt-1">Start by adding some data!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4">
          <div className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-2xl p-4 shadow-[0_8px_30px_rgb(233,30,99,0.15)] transition-all duration-300 hover:shadow-[0_12px_40px_rgb(233,30,99,0.25)]">
            <h2 className="text-sm font-semibold text-pink-700 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex items-center p-2 rounded-lg bg-pink-50/60 hover:bg-pink-100/70 border border-pink-200/50 transition-all duration-300 hover:scale-[1.02] group"
                >
                  <div className="w-6 h-6 bg-white rounded-md mr-3 flex items-center justify-center group-hover:bg-pink-50 transition-all duration-200 shadow-sm">
                    <span className="text-xs">{action.icon}</span>
                  </div>
                  <span className="text-xs font-medium text-pink-700 group-hover:text-pink-800 transition-colors">
                    {action.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Summary Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Categories Summary */}
          <div className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-2xl p-4 shadow-[0_8px_30px_rgb(233,30,99,0.15)]">
            <h3 className="text-sm font-semibold text-pink-700 mb-2">Categories</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-blue-600">Men: {categories.filter(cat => cat.gender === 'men').length}</span>
                <span className="text-pink-600">Women: {categories.filter(cat => cat.gender === 'women').length}</span>
              </div>
              <div className="text-xs text-purple-600">
                Unisex: {categories.filter(cat => cat.gender === 'unisex').length}
              </div>
            </div>
          </div>

          {/* Branches Summary */}
          {/* <div className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-2xl p-4 shadow-[0_8px_30px_rgb(233,30,99,0.15)]">
            <h3 className="text-sm font-semibold text-pink-700 mb-2">Branches</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Active: {activeBranches.length}</span>
                <span className="text-gray-600">Inactive: {branches.length - activeBranches.length}</span>
              </div>
              <div className="text-xs text-pink-600">
                Total Locations: {branches.length}
              </div>
            </div>
          </div> */}

          {/* Offers Summary */}
          <div className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-2xl p-4 shadow-[0_8px_30px_rgb(233,30,99,0.15)]">
            <h3 className="text-sm font-semibold text-pink-700 mb-2">Offers</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Active: {activeOffers.length}</span>
                <span className="text-gray-600">Total: {offers.length}</span>
              </div>
              <div className="text-xs text-pink-600">
                Expired: {offers.filter(offer => new Date(offer.validTo) < new Date()).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}