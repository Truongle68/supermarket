'use client'

import Link from "next/link"
import { LayoutDashboard, Package, ExternalLink, LogOut } from "lucide-react"

interface AdminSidebarProps {
  user: { name: string; email?: string }
  activeTab: 'overview' | 'products'
  setActiveTab: (tab: 'overview' | 'products') => void
  productCount: number
  onLogout: () => void
}

export function AdminSidebar({
  user,
  activeTab,
  setActiveTab,
  productCount,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-slate-950 text-slate-200 border-r border-slate-900 hidden md:flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-20 px-6 flex items-center border-b border-slate-900 gap-2 select-none">
        <span className="text-2xl font-extrabold text-[#1DA1F2] tracking-tight">Tươi. Admin</span>
      </div>

      {/* Admin User Summary */}
      <div className="p-5 border-b border-slate-900 flex items-center gap-3 bg-slate-900/30">
        <div className="h-10 w-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center text-sm font-bold shadow-md shrink-0">
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-100 truncate">{user.name}</h4>
          <span className="text-2xs text-[#1DA1F2] font-extrabold tracking-wider uppercase">Hệ thống Admin</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-4 space-y-1.5">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center justify-between px-4 py-3 font-bold rounded-[1.3rem] text-sm transition-all cursor-pointer ${
            activeTab === 'overview'
              ? "bg-[#1DA1F2]/10 text-[#1DA1F2]"
              : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Tổng quan</span>
          </div>
        </button>
        
        <button 
          onClick={() => setActiveTab('products')}
          className={`w-full flex items-center justify-between px-4 py-3 font-bold rounded-[1.3rem] text-sm transition-all cursor-pointer ${
            activeTab === 'products'
              ? "bg-[#1DA1F2]/10 text-[#1DA1F2]"
              : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 shrink-0" />
            <span>Quản lý sản phẩm</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-2xs font-extrabold ${
            activeTab === 'products' ? "bg-[#1DA1F2] text-white" : "bg-slate-800 text-slate-300"
          }`}>
            {productCount}
          </span>
        </button>

        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 font-bold rounded-[1.3rem] text-sm transition-all"
        >
          <ExternalLink className="w-5 h-5 shrink-0" />
          <span>Xem cửa hàng</span>
        </Link>
      </nav>

      {/* Footer actions */}
      <div className="p-4 border-t border-slate-900">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 font-bold rounded-[1.3rem] text-sm border border-slate-800 hover:border-rose-900/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
