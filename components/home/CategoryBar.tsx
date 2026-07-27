'use client'

import { Layers } from "lucide-react"

interface CategoryBarProps {
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
}

export function CategoryBar({
  categories,
  selectedCategory,
  setSelectedCategory,
}: CategoryBarProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => setSelectedCategory("all")}
        className={`px-5 py-3 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
          selectedCategory === "all"
            ? "bg-[#1B4D3E] text-white shadow-md shadow-[#1B4D3E]/20"
            : "bg-white text-[#64716A] hover:bg-[#FAF6EC] border border-[#EBE6DA]"
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>Tất cả sản phẩm</span>
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          className={`px-5 py-3 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            selectedCategory === cat
              ? "bg-[#1B4D3E] text-white shadow-md shadow-[#1B4D3E]/20"
              : "bg-white text-[#64716A] hover:bg-[#FAF6EC] border border-[#EBE6DA]"
          }`}
        >
          <span>{cat}</span>
        </button>
      ))}
    </div>
  )
}
