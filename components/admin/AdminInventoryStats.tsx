'use client'

import { Box, AlertTriangle, Layers, DollarSign } from "lucide-react"
import { formatPriceVND } from "@/lib/utils"

interface AdminInventoryStatsProps {
  productCount: number
  lowStockCount: number
  categoryCount: number
  totalInventoryValue: number
}

export function AdminInventoryStats({
  productCount,
  lowStockCount,
  categoryCount,
  totalInventoryValue,
}: AdminInventoryStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Items Card */}
      <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Tổng mặt hàng</span>
          <div className="h-10 w-10 bg-blue-50 text-[#1DA1F2] rounded-full flex items-center justify-center font-bold">
            <Box className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-extrabold text-[#16422F]">{productCount} sản phẩm</h3>
          <span className="text-xs text-[#64716A] font-semibold block mt-1">Đang kinh doanh trong cửa hàng</span>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-amber-400/40 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Cảnh báo tồn kho</span>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
            lowStockCount > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-extrabold text-[#16422F]">{lowStockCount} sản phẩm</h3>
          <span className={`text-xs font-bold block mt-1 ${lowStockCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {lowStockCount > 0 ? "Cần nhập thêm hàng (≤ 10)" : "Tồn kho đầy đủ, ổn định"}
          </span>
        </div>
      </div>

      {/* Categories Count */}
      <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Danh mục ngành hàng</span>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-extrabold text-[#16422F]">{categoryCount} danh mục</h3>
          <span className="text-xs text-[#1DA1F2] font-semibold block mt-1">Phân loại hàng hóa tự động</span>
        </div>
      </div>

      {/* Total Inventory Valuation */}
      <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm hover:border-[#1DA1F2]/30 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-extrabold tracking-wider uppercase text-[#8E9B94]">Giá trị kho hàng</span>
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-extrabold text-[#16422F]">
            {formatPriceVND(totalInventoryValue)}
          </h3>
          <span className="text-xs text-emerald-600 font-bold block mt-1">Ước tính giá trị hàng còn lại</span>
        </div>
      </div>
    </div>
  )
}
