"use client"
import * as React from "react"
import { User, LogIn, Menu } from "lucide-react"

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Navbar = ({ onToggleSidebar, sidebarOpen }: NavbarProps) => {
  const [isSignedIn, setIsSignedIn] = React.useState(true)
  const [isDark, setIsDark] = React.useState(false)

  const handleSignIn = () => {
    setIsSignedIn(true)
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div
      className="absolute top-2 right-4 z-50 transition-all duration-300"
      style={{
        left: sidebarOpen ? '184px' : '62px'
      }}
    >
      <nav className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-2xl shadow-[0_12px_40px_rgb(233,30,99,0.25)] transition-all duration-500 ease-out hover:shadow-[0_20px_50px_rgb(233,30,99,0.35)] will-change-transform">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-pink-500/5 rounded-2xl blur-xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Left Side - Hamburger Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onToggleSidebar}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-pink-50 transition-all duration-300 ease-out hover:scale-110 active:scale-95 will-change-transform"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-4 w-4 text-pink-600" />
              </button>

              {/* Beautiful Enhanced Logo */}
              <div className="flex-shrink-0 will-change-transform relative group">
                {/* Multiple layered glow effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-pink-400/10 to-pink-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-pink-300/15 via-pink-200/8 to-pink-300/15 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100" />

                <h1 className="relative text-base font-bold transition-all duration-300 ease-out group-hover:scale-105">
                  <span className="text-gray-900">Mirror</span>{" "}
                  <span className="relative inline-block">
                    {/* Text shadow for depth */}
                    <span className="absolute inset-0 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 bg-clip-text text-transparent blur-sm opacity-50"></span>
                    <span className="relative bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 bg-clip-text text-transparent transition-all duration-300 ease-out group-hover:from-pink-500 group-hover:via-pink-400 group-hover:to-pink-500">
                      Salon
                    </span>
                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100" />
                  </span>
                </h1>
              </div>
            </div>

            {/* Right Side - Profile and Theme Toggle */}
            <div className="flex items-center space-x-2 will-change-transform">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-pink-50 transition-all duration-200"
              >
                <div className="relative w-4 h-4">
                  {isDark ? (
                    <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Desktop Profile */}
              <div className="hidden md:flex items-center">
                {!isSignedIn ? (
                  <button
                    onClick={handleSignIn}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-pink-700 bg-pink-100/60 hover:bg-pink-200/70 rounded-lg transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border border-pink-200/50 will-change-transform"
                  >
                    <LogIn className="h-3 w-3 transition-transform duration-300 ease-out" />
                    <span>Sign In</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3 transition-all duration-300 ease-out">
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-pink-100/60 to-pink-200/50 flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 will-change-transform border border-pink-200/50">
                        <User className="h-3 w-3 text-pink-600 transition-all duration-300 ease-out" />
                      </div>
                      <span className="text-xs font-medium text-gray-900 transition-all duration-300 ease-out">Admin User</span>
                    </div>

                  </div>
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