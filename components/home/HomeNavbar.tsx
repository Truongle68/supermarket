'use client'

import Link from "next/link"
import { Search, ShoppingBag, User, LogOut } from "lucide-react"

interface HomeNavbarProps {
  user: { name: string; role?: string } | null
  isAuthenticated: boolean
  cartItemCount: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  onLogout: () => void
}

export function HomeNavbar({
  user,
  isAuthenticated,
  cartItemCount,
  searchTerm,
  setSearchTerm,
  onLogout,
}: HomeNavbarProps) {
  return (
    <nav className="border-b border-[#EBE6DA] bg-[#FAF6EC]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-black text-[#1B4D3E] tracking-tight">
            Tươi<span className="text-emerald-500">.</span>
          </span>
        </Link>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8E9B94]" />
            <input 
              type="text"
              placeholder="Tìm thực phẩm tươi sạch, rau củ, trái cây..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#EBE6DA] rounded-full text-xs text-[#1E2522] placeholder-[#8E9B94] font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Navigation & User Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Cart Icon Button */}
          <button 
            className="h-11 px-4 bg-[#1B4D3E] hover:bg-[#16422F] text-white rounded-full flex items-center gap-2.5 text-xs font-extrabold shadow-md shadow-[#1B4D3E]/20 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            {cartItemCount > 0 ? (
              <span className="bg-emerald-500 text-white text-2xs px-2 py-0.5 rounded-full font-bold">
                {cartItemCount}
              </span>
            ) : null}
          </button>

          {/* Authentication State */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link 
                href={user.role === 'admin' ? "/admin" : user.role === 'staff' ? "/staff" : "/profile"}
                className="h-11 px-4 bg-white border border-[#EBE6DA] hover:border-[#1B4D3E] rounded-full flex items-center gap-2 text-xs font-extrabold text-[#1B4D3E] transition-all"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span className="max-w-[100px] truncate">{user.name}</span>
                {user.role === 'admin' ? (
                  <span className="bg-blue-100 text-blue-800 text-2xs px-1.5 py-0.5 rounded font-extrabold">Admin</span>
                ) : user.role === 'staff' ? (
                  <span className="bg-amber-100 text-amber-800 text-2xs px-1.5 py-0.5 rounded font-extrabold">Staff</span>
                ) : null}
              </Link>
              <button
                onClick={onLogout}
                className="h-11 w-11 bg-white border border-[#EBE6DA] hover:bg-rose-50 hover:border-rose-200 text-[#64716A] hover:text-rose-600 rounded-full flex items-center justify-center transition-all cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/login"
                className="h-11 px-5 bg-white border border-[#EBE6DA] hover:border-[#1B4D3E] text-[#1B4D3E] rounded-full flex items-center text-xs font-extrabold transition-all"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register"
                className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full hidden sm:flex items-center text-xs font-extrabold shadow-sm transition-all"
              >
                Đăng ký
              </Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}
