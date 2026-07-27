'use client'

import { Sparkles, ArrowRight } from "lucide-react"

export function HomeHeroBanner() {
  return (
    <div className="bg-[#1B4D3E] text-white rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden shadow-2xl">
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="max-w-2xl relative z-10">
        <span className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-300 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 border border-emerald-400/30">
          <Sparkles className="w-4 h-4 text-amber-300" /> Thực phẩm tươi sạch mỗi ngày
        </span>
        <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
          Nông sản hữu cơ từ trang trại đến bàn ăn
        </h1>
        <p className="text-sm md:text-base text-emerald-100/90 font-medium mt-4 leading-relaxed">
          Cam kết 100% không hóa chất độc hại, giao hàng nhanh siêu tốc trong 2h tại khu vực nội thành.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a 
            href="#products-section"
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Mua sắm ngay</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
