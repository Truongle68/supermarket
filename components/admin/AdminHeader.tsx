'use client'

import { RefreshCw, Bell } from "lucide-react"

interface AdminHeaderProps {
  activeTab: 'overview' | 'products'
  setActiveTab: (tab: 'overview' | 'products') => void
  productCount: number
  onRefresh: () => void
}

export function AdminHeader({
  activeTab,
  setActiveTab,
  productCount,
  onRefresh,
}: AdminHeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-[#EBE6DA] px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="md:hidden text-lg font-bold text-[#1DA1F2]">Tươi. Admin</span>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-[#16422F] hidden md:block">
            {activeTab === 'overview' ? "Bảng điều khiển" : "Quản lý sản phẩm"}
          </h2>
          {activeTab === 'products' && (
            <span className="hidden md:inline-flex items-center bg-blue-50 text-[#1DA1F2] text-2xs font-extrabold px-2.5 py-0.5 rounded-full border border-blue-100">
              {productCount} Hàng hóa
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Switch Mobile Tabs */}
        <div className="md:hidden flex items-center bg-slate-100 p-1 rounded-full text-xs font-bold">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-full ${activeTab === 'overview' ? "bg-white shadow text-[#1DA1F2]" : "text-slate-600"}`}
          >
            Tổng quan
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1 rounded-full ${activeTab === 'products' ? "bg-white shadow text-[#1DA1F2]" : "text-slate-600"}`}
          >
            Sản phẩm
          </button>
        </div>

        <button 
          onClick={onRefresh}
          className="h-10 w-10 flex items-center justify-center rounded-full border border-[#EBE6DA] hover:bg-slate-50 transition-all text-[#64716A]"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>

        <button className="h-10 w-10 flex items-center justify-center rounded-full border border-[#EBE6DA] hover:bg-slate-50 transition-all text-[#64716A] relative">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-[#1DA1F2] rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  )
}
