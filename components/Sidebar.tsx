'use client'

import { useState, useEffect } from 'react'
import { FiHome, FiDatabase, FiActivity, FiBarChart, FiGlobe, FiChevronLeft, FiChevronRight, FiMenu, FiX } from 'react-icons/fi'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/', icon: FiHome },
  { name: 'Data Beasiswa', href: '/beasiswa', icon: FiDatabase },
  { name: 'Website Beasiswa', href: '/websites', icon: FiGlobe },
  { name: 'Monitoring', href: '/monitoring', icon: FiActivity },
  { name: 'Analytics', href: '/analytics', icon: FiBarChart },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Load collapse state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    // Save to localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  const closeMobileMenu = () => {
    setIsMobileOpen(false)
  }

  const NavigationItems = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={closeMobileMenu}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              isActive
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon
              className={`flex-shrink-0 h-6 w-6 ${
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
              } ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
            />
            {!isCollapsed && (
              <span className="truncate">{item.name}</span>
            )}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200"
          aria-label="Toggle mobile menu"
        >
          {isMobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-gray-900">
            <h1 className="text-xl font-semibold text-white">
              🎓 Beasiswa
            </h1>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
              aria-label="Close mobile menu"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 bg-gray-800 space-y-1">
              <NavigationItems />
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className={`flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
          <div className="flex flex-col h-0 flex-1 bg-gray-800">
            {/* Header dengan tombol toggle */}
            <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-gray-900">
              {!isCollapsed && (
                <h1 className="text-xl font-semibold text-white truncate">
                  🎓 Beasiswa
                </h1>
              )}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 bg-gray-800 space-y-1">
                <NavigationItems />
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 