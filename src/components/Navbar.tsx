
"use client"
import * as React from "react"
import { User, LogIn, Menu, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { signOutUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  isMobile?: boolean;
}

const Navbar = ({ onToggleSidebar, sidebarOpen, isMobile = false }: NavbarProps) => {
  const { user, userRole } = useAuth()
  const router = useRouter()
  // const [isDark, setIsDark] = React.useState(false)
  const [showUserMenu, setShowUserMenu] = React.useState(false)

  const menuRef = React.useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      console.log('Starting sign out process...')
      
      const { error } = await signOutUser()
      console.log('Sign out result:', { error })
      
      if (error) {
        console.error('Sign out error:', error)
        alert('Error signing out: ' + error)
        setShowUserMenu(false)
      } else {
        console.log('Sign out successful, redirecting...')
        setShowUserMenu(false)
        // Use router for cleaner navigation
        router.push('/signin')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      alert('Error signing out: ' + error)
      setShowUserMenu(false)
    }
  }

  // const toggleTheme = () => {
  //   setIsDark(!isDark)
  //   document.documentElement.classList.toggle('dark')
  // }

  return (
    <div
      className={`
        fixed top-2 right-2 transition-all duration-300
        ${isMobile
          ? 'left-2 z-[60]'
          : sidebarOpen
            ? 'left-44 z-50'
            : 'left-16 z-50'
        }
      `}
    >
      <nav className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-2xl shadow-[0_12px_40px_rgb(233,30,99,0.25)] transition-all duration-500 ease-out hover:shadow-[0_20px_50px_rgb(233,30,99,0.35)] will-change-transform">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-pink-500/5 rounded-2xl blur-xl" />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-10 sm:h-12">
            {/* Left Side - Hamburger Menu */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={onToggleSidebar}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-pink-50 transition-all duration-300 ease-out hover:scale-110 active:scale-95 will-change-transform relative z-10"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600" />
              </button>

              {/* Beautiful Enhanced Logo - Responsive with Curvy Font */}
              <div className="flex-shrink-0 will-change-transform relative group ml-2">
                {/* Multiple layered glow effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-pink-400/10 to-pink-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-pink-300/15 via-pink-200/8 to-pink-300/15 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100" />

                <h1
                  className="relative text-sm sm:text-base transition-all duration-300 ease-out group-hover:scale-105 text-pink-600"
                  style={{
                    fontFamily: 'var(--font-dancing-script), "Brush Script MT", cursive',
                    fontWeight: '500',
                    letterSpacing: '0.5px'
                  }}
                >
                  Mirror Salon
                </h1>
              </div>
            </div>

            {/* Right Side - Profile and Theme Toggle */}
            <div className="flex items-center space-x-1 sm:space-x-2 will-change-transform">
              {/* Theme Toggle Button */}
              {/* <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-pink-50 transition-all duration-200"
              >
                <div className="relative w-3 h-3 sm:w-4 sm:h-4">
                  {isDark ? (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </div>
              </button> */}

              {/* Profile - Always visible but responsive */}
              <div className="flex items-center relative">
                {user ? (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-1 sm:space-x-2 transition-all duration-300 ease-out hover:bg-pink-50 rounded-lg p-1"
                    >
                      <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-br from-pink-100/60 to-pink-200/50 flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 will-change-transform border border-pink-200/50">
                        <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-pink-600 transition-all duration-300 ease-out" />
                      </div>
                      <span className="text-xs font-medium text-gray-900 transition-all duration-300 ease-out hidden sm:inline">
                        {user.displayName || user.email?.split('@')[0] || 'Admin'}
                      </span>
                    </button>

                    {/* User Menu Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl border border-pink-200/30 rounded-xl shadow-[0_12px_40px_rgb(233,30,99,0.25)] z-50">
                        <div className="p-3 border-b border-pink-100">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {user.displayName || user.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <p className="text-xs text-pink-600 capitalize">{userRole?.role || 'User'}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push('/profile');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                          >
                            <User className="h-3 w-3" />
                            <span>Profile</span>
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <LogOut className="h-3 w-3" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => router.push('/signin')}
                    className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-pink-700 bg-pink-100/60 hover:bg-pink-200/70 rounded-lg transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-pink-200/50 will-change-transform"
                  >
                    <LogIn className="h-3 w-3 transition-transform duration-300 ease-out" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar