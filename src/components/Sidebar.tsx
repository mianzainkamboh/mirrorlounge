'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';


import {
  LayoutDashboard,
  FolderOpen,
  Scissors,
  Tag,

  Users,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Curvy font styles using CSS variables
const curvyStyles = {
  fontFamily: 'var(--font-dancing-script), "Brush Script MT", cursive',
  fontWeight: '500',
  letterSpacing: '0.5px'
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", roles: ['admin', 'user'] },
  { icon: FolderOpen, label: "Categories", href: "/catagories", roles: ['admin', 'user'] },
  { icon: Scissors, label: "Services", href: "/services", roles: ['admin', 'user'] },
  { icon: Tag, label: "Offers", href: "/offers", roles: ['admin', 'user'] },
  // { icon: Building2, label: "Branches", href: "/branches", roles: ['admin', 'user'] },
  { icon: Users, label: "Users", href: "/users", roles: ['admin'] },
  { icon: User, label: "Profile", href: "/profile", roles: ['admin', 'user'] },
];

interface SidebarProps {
  collapsed: boolean;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ collapsed, isMobile = false, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { userRole } = useAuth();

  // Helper function to check if a menu item is active
  const isMenuItemActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => {
    const currentRole = userRole?.role || 'user';
    return item.roles.includes(currentRole);
  });

  // Note: Sidebar now closes immediately on click rather than waiting for route change

  return (
    <motion.div
      initial={false}
      animate={{
        width: isMobile ? (isOpen ? "280px" : "0px") : (collapsed ? "54px" : "176px"),
        x: isMobile ? (isOpen ? 0 : -280) : 0
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5
      }}
      className={cn(
        "fixed left-0 top-0 z-50 flex flex-col overflow-hidden",
        "shadow-lg bg-white/95 backdrop-blur-sm border border-pink-400/20",
        isMobile
          ? "h-full m-0 rounded-none border-r"
          : "h-[95vh] m-2 rounded-2xl"
      )}
      style={{
        willChange: 'transform, width',
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Content Container */}
      <div className={cn(
        "relative z-10 flex flex-col h-full items-center",
        isMobile ? "px-4 py-4 safe-area-inset-top" : "px-2 py-6"
      )}>
        {/* Simple Logo */}
        <motion.div
          className={cn(
            "flex-shrink-0 flex flex-col items-center justify-center mb-4 mx-auto",
            isMobile ? "py-2" : "py-3 mb-3"
          )}
          layout
          transition={{ duration: 0.15 }}
        >
          {(collapsed && !isMobile) ? (
            <span
              className="text-pink-600 text-2xl"
              style={curvyStyles}
            >
              M
            </span>
          ) : (
            <h1
              className={cn(
                "text-pink-600 text-center",
                isMobile ? "text-2xl" : "text-lg"
              )}
              style={curvyStyles}
            >
              Mirror Salon
            </h1>
          )}
        </motion.div>

        {/* Navigation */}
        <div className={cn(
          "overflow-y-auto flex-1 w-full",
          isMobile ? "pr-2" : "pr-1"
        )}>
          <nav className={cn(
            "flex flex-col",
            isMobile ? "space-y-2" : "space-y-1.5"
          )}>
            {filteredNavItems.map(({ icon: Icon, label, href }, index) => {
              const isActive = isMenuItemActive(href);

              const handleNavClick = () => {
                // Close sidebar immediately on mobile when clicking any nav item
                if (isMobile && onClose) {
                  onClose();
                }
              };

              return (
                <motion.div
                  key={index}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                >
                  <Link href={href} onClick={handleNavClick}>
                    <motion.div
                      layout
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "flex items-center rounded-xl cursor-pointer relative transition-all duration-200",
                        isMobile
                          ? "px-4 py-3.5 min-h-[48px]"
                          : collapsed
                            ? "px-2.5 py-1.5 justify-center"
                            : "px-2.5 py-1.5",
                        isActive
                          ? "bg-pink-500/20 text-pink-600 shadow-sm"
                          : "hover:bg-pink-500/10 text-gray-700 hover:text-pink-600 active:bg-pink-500/15"
                      )}
                    >
                      <div className="flex items-center justify-center flex-shrink-0">
                        <Icon className={cn(
                          isMobile ? "w-5 h-5" : "w-3.5 h-3.5",
                          isActive
                            ? "text-pink-600"
                            : "text-gray-700",
                          "transition-colors duration-200"
                        )} />
                      </div>

                      {(!collapsed || isMobile) && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-between w-full ml-3"
                        >
                          <span className={cn(
                            "font-medium flex items-center transition-colors duration-200",
                            isMobile ? "text-base" : "text-[10px]",
                            isActive
                              ? "text-pink-600"
                              : "text-gray-700"
                          )}>
                            {label}
                          </span>
                          {/* Active indicator for mobile */}
                          {isMobile && isActive && (
                            <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0" />
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Decorative Element */}
        <motion.div
          layout
          className={cn(
            "flex justify-center",
            isMobile ? "mt-4 mb-2" : "mt-2"
          )}
        >
          <div className={cn(
            "bg-pink-500/30 rounded-full",
            isMobile ? "w-16 h-0.5" : "w-12 h-0.5"
          )} />
        </motion.div>

        {/* Mobile Footer Info */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-center"
          >
            <p className="text-xs text-pink-500/70 font-medium">
              Admin Panel
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}