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
  Building2
} from 'lucide-react';

// Curvy font styles using CSS variables
const curvyStyles = {
  fontFamily: 'var(--font-dancing-script), "Brush Script MT", cursive',
  fontWeight: '500',
  letterSpacing: '0.5px'
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FolderOpen, label: "Categories", href: "/catagories" },
  { icon: Scissors, label: "Services", href: "/services" },
  { icon: Tag, label: "Offers", href: "/offers" },
  // { icon: Building2, label: "Branches", href: "/branches" },
];

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  // Helper function to check if a menu item is active
  const isMenuItemActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.div
      initial={false}
      animate={{
        width: collapsed ? "54px" : "176px"
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5
      }}
      className={cn(
        "fixed left-0 top-0 z-50 flex flex-col h-[95vh] m-2",
        "shadow-lg rounded-2xl overflow-hidden",
        "bg-white/95 backdrop-blur-sm",
        "border border-pink-400/20"
      )}
      style={{
        willChange: 'transform, width',
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full px-2 py-6 items-center">
        {/* Simple Logo */}
        <motion.div
          className="flex-shrink-0 flex flex-col items-center justify-center py-3 mb-3 mx-auto"
          layout
          transition={{ duration: 0.15 }}
        >
          {collapsed ? (
            <span 
              className="text-pink-600 text-2xl" 
              style={curvyStyles}
            >
              M
            </span>
          ) : (
            <h1 
              className="text-pink-600 text-lg"
              style={curvyStyles}
            >
              Mirror Salon
            </h1>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-1 w-full">
          <nav className="flex flex-col space-y-1.5">
            {navItems.map(({ icon: Icon, label, href }, index) => {
              const isActive = isMenuItemActive(href);

              return (
                <motion.div
                  key={index}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                >
                  <Link href={href}>
                    <motion.div
                      layout
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "flex items-center px-2.5 py-1.5 rounded-xl cursor-pointer relative",
                        collapsed && "justify-center",
                        isActive
                          ? "bg-pink-500/20 text-pink-600"
                          : "hover:bg-pink-500/10 text-gray-700 hover:text-pink-600"
                      )}
                    >
                      <div className="flex items-center justify-center">
                        <Icon className={cn(
                          "w-3.5 h-3.5",
                          isActive
                            ? "text-pink-600"
                            : "text-gray-700"
                        )} />
                      </div>

                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-between w-full ml-3"
                        >
                          <span className={cn(
                            "text-[10px] font-medium flex items-center",
                            isActive
                              ? "text-pink-600"
                              : "text-gray-700"
                          )}>
                            {label}
                          </span>
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
          className="mt-2 flex justify-center"
        >
          <div className="w-12 h-0.5 bg-pink-500/30 rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  );
}