'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SidebarWrapper from './SidebarWrapper';
import Navbar from './Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import FirebaseDebug from './FirebaseDebug';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Mobile-first: sidebar hidden by default on mobile, collapsed on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if current page should be protected
  const isPublicPage = pathname === '/signin';

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      
      // On mobile, sidebar should be closed by default
      // On desktop, check localStorage or default to collapsed
      if (mobile) {
        setSidebarOpen(false);
      } else {
        const saved = localStorage.getItem('sidebar-collapsed');
        setSidebarOpen(saved ? saved === 'false' : false); // Default collapsed on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    // Only save to localStorage on desktop
    if (!isMobile) {
      localStorage.setItem('sidebar-collapsed', (!newState).toString());
    }
  };

  // Close sidebar when clicking outside on mobile
  const closeSidebar = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <AuthProvider>
      <FirebaseDebug />
      {isPublicPage ? (
        // Public pages (like sign-in) - no protection needed
        children
      ) : (
        // Protected pages - require authentication
        <ProtectedRoute>
          <div className="min-h-screen bg-white">
            {/* Mobile overlay with improved backdrop */}
            {isMobile && sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                onClick={closeSidebar}
                style={{ touchAction: 'none' }}
              />
            )}
            
            {/* Navbar */}
            <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} isMobile={isMobile} />
            
            {/* Sidebar */}
            <SidebarWrapper 
              collapsed={!sidebarOpen} 
              setCollapsed={(collapsed) => setSidebarOpen(!collapsed)}
              isMobile={isMobile}
              isOpen={sidebarOpen}
              onClose={closeSidebar}
            />
            
            {/* Main content */}
            <main 
              className={`
                transition-all duration-300 ease-out 
                pt-14 pb-4 px-1
                sm:pt-16 sm:pb-6 sm:px-2
                md:pt-20 md:pb-6 md:px-4
                ${isMobile 
                  ? 'ml-0' 
                  : sidebarOpen 
                    ? 'ml-44' 
                    : 'ml-16'
                }
              `}
            >
              <div className="content-container max-w-full">
                {children}
              </div>
            </main>
          </div>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}