'use client'

import { FiSearch, FiRefreshCw, FiBell, FiUser } from 'react-icons/fi'

interface HeaderProps {
  searchTerm?: string
  onSearchChange?: (term: string) => void
  onRefresh?: () => void
  showSearch?: boolean
  showRefresh?: boolean
}

export default function Header({ searchTerm = "", onSearchChange, onRefresh, showSearch = true, showRefresh = true }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {showSearch ? (
            <div className="flex items-center flex-1 max-w-lg">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Cari beasiswa..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
                     ) : (
             <div className="flex items-center flex-1">
               <h1 className="text-xl font-semibold text-gray-900">
                 Dashboard
               </h1>
             </div>
           )}

          <div className="flex items-center space-x-4">
            {showRefresh && onRefresh && (
              <button
                onClick={onRefresh}
                className="btn-primary flex items-center space-x-2"
              >
                <FiRefreshCw className="h-4 w-4" />
                <span>Refresh Data</span>
              </button>
            )}

            <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <FiBell className="h-6 w-6" />
            </button>

            <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <FiUser className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 