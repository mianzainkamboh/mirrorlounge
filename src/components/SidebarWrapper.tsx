'use client';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function SidebarWrapper({
  collapsed,
  setCollapsed,
  isMobile = false,
  isOpen = false,
  onClose,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  useEffect(() => {
    const handler = () => {
      const val = localStorage.getItem('sidebar-collapsed') === 'true';
      setCollapsed(val);
    };
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, [setCollapsed]);

  return <Sidebar collapsed={collapsed} isMobile={isMobile} isOpen={isOpen} onClose={onClose} />;
}