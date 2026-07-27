'use client'

import { DollarSign, ShoppingBag, Users, BarChart3 } from "lucide-react"

interface AdminOverviewStatsProps {
  stats: {
    revenue: string
    revenueChange: string
    orders: string
    ordersChange: string
    customers: string
    customersChange: string
    conversionRate: string
    conversionChange: string
  } | null
  isLoading: boolean
}

export function AdminOverviewStats({ stats, isLoading }: AdminOverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Revenue Card */}
      <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Doanh thu hôm nay</span>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          {isLoading ? (
            <div className="h-8 w-32 bg-slate-100 animate-pulse rounded-md"></div>
          ) : (
            <h3 className="text-2xl font-extrabold text-[#16422F]">{stats?.revenue}</h3>
          )}
          <span className="text-xs text-emerald-600 font-bold block mt-1">{stats?.revenueChange}</span>
        </div>
      </div>

      {/* Orders Card */}
      <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Đơn đặt hàng</span>
          <div className="h-10 w-10 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-full flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md"></div>
          ) : (
            <h3 className="text-2xl font-extrabold text-[#16422F]">{stats?.orders}</h3>
          )}
          <span className="text-xs text-emerald-600 font-bold block mt-1">{stats?.ordersChange}</span>
        </div>
      </div>

      {/* Customers Card */}
      <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Khách hàng</span>
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          {isLoading ? (
            <div className="h-8 w-28 bg-slate-100 animate-pulse rounded-md"></div>
          ) : (
            <h3 className="text-2xl font-extrabold text-[#16422F]">{stats?.customers}</h3>
          )}
          <span className="text-xs text-[#1DA1F2] font-bold block mt-1">{stats?.customersChange}</span>
        </div>
      </div>

      {/* Conversion Rate Card */}
      <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Tỷ lệ chuyển đổi</span>
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-md"></div>
          ) : (
            <h3 className="text-2xl font-extrabold text-[#16422F]">{stats?.conversionRate}</h3>
          )}
          <span className="text-xs text-emerald-600 font-bold block mt-1">{stats?.conversionChange}</span>
        </div>
      </div>
    </div>
  )
}
