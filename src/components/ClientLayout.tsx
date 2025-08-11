'use client';

import { useState } from 'react';
import SidebarWrapper from './SidebarWrapper';
import Navbar from './Navbar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sidebar is collapsed by default (like the example)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    localStorage.setItem('sidebar-collapsed', (!sidebarCollapsed).toString());
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={!sidebarCollapsed} />
      
      {/* Sidebar */}
      <SidebarWrapper collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      {/* Main content */}
      <main 
        className="transition-all duration-300 ease-out pt-20 pb-6"
        style={{
          marginLeft: sidebarCollapsed ? '62px' : '184px',
          marginRight: '8px'
        }}
      >
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
}