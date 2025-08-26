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
  MessageCircle,
  Users,
  User,
  Calendar,
  Building2
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
  { icon: Calendar, label: "Bookings", href: "/bookings", roles: ['admin'] },
  { icon: MessageCircle, label: "Chat", href: "/chat", roles: ['admin'] },
  { icon: Building2, label: "Branches", href: "/branches", roles: ['admin', 'user'] },
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
        "bg-gradient-to-br from-white/95 via-pink-50/90 to-white/95",
        "backdrop-blur-xl border border-pink-200/40 shadow-2xl shadow-pink-500/10",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-pink-100/20 before:to-transparent before:pointer-events-none",
        isMobile
          ? "h-full m-0 rounded-none border-r"
          : "h-[95vh] m-2 rounded-3xl"
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
        {/* Enhanced Logo */}
        <motion.div
          className={cn(
            "flex-shrink-0 flex flex-col items-center justify-center mb-6 mx-auto relative",
            "bg-gradient-to-br from-pink-100/50 to-pink-200/30 rounded-2xl p-3",
            "shadow-lg shadow-pink-500/20 border border-pink-200/50",
            isMobile ? "py-3" : "py-4 mb-4"
          )}
          layout
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.02, y: -1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 to-transparent rounded-2xl" />
          {(collapsed && !isMobile) ? (
            <motion.span
              className="text-pink-600 text-3xl font-bold relative z-10 drop-shadow-sm"
              style={curvyStyles}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              M
            </motion.span>
          ) : (
            <motion.h1
              className={cn(
                "text-pink-600 text-center relative z-10 drop-shadow-sm",
                "bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent",
                isMobile ? "text-2xl" : "text-xl"
              )}
              style={curvyStyles}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Mirror Salon
            </motion.h1>
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
                      transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "group flex items-center rounded-2xl cursor-pointer relative transition-all duration-300",
                        "backdrop-blur-sm border border-transparent",
                        isMobile
                          ? "px-4 py-3.5 min-h-[48px]"
                          : collapsed
                            ? "px-3 py-2 justify-center"
                            : "px-3 py-2",
                        isActive
                          ? "bg-gradient-to-r from-pink-500/25 to-pink-400/20 text-pink-700 shadow-lg shadow-pink-500/25 border-pink-300/40"
                          : "hover:bg-gradient-to-r hover:from-pink-500/15 hover:to-pink-400/10 text-gray-600 hover:text-pink-600 hover:shadow-md hover:shadow-pink-500/15 hover:border-pink-200/30"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center flex-shrink-0 relative",
                        "rounded-xl p-1.5",
                        isActive
                          ? "bg-pink-500/20 shadow-sm"
                          : "group-hover:bg-pink-500/10"
                      )}>
                        <Icon className={cn(
                          isMobile ? "w-5 h-5" : "w-4 h-4",
                          isActive
                            ? "text-pink-700 drop-shadow-sm"
                            : "text-gray-600 group-hover:text-pink-600",
                          "transition-all duration-300 transform"
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
                            "font-semibold flex items-center transition-all duration-300",
                            "tracking-wide",
                            isMobile ? "text-base" : "text-xs",
                            isActive
                              ? "text-pink-700 drop-shadow-sm"
                              : "text-gray-600 group-hover:text-pink-600"
                          )}>
                            {label}
                          </span>
                          {/* Enhanced active indicator */}
                          {isMobile && isActive && (
                            <motion.div 
                              className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-pink-400 rounded-full flex-shrink-0 shadow-sm shadow-pink-500/50"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            />
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

        {/* Enhanced Decorative Element */}
        <motion.div
          layout
          className={cn(
            "flex justify-center relative",
            isMobile ? "mt-6 mb-3" : "mt-4"
          )}
        >
          <div className={cn(
            "bg-gradient-to-r from-transparent via-pink-400/40 to-transparent rounded-full relative",
            "shadow-sm shadow-pink-500/20",
            isMobile ? "w-20 h-1" : "w-16 h-1"
          )}>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-300/30 to-pink-500/30 rounded-full blur-sm" />
          </div>
        </motion.div>

        {/* Enhanced Mobile Footer Info */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-center px-4 py-2 bg-gradient-to-r from-pink-100/50 to-pink-200/30 rounded-xl border border-pink-200/40"
          >
            <p className="text-xs text-pink-600/80 font-semibold tracking-wide">
              Admin Panel
            </p>
            <div className="w-8 h-0.5 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full mx-auto mt-1" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}