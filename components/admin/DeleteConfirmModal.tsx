'use client'

import { Product } from "@/lib/store/useProductStore"
import { AlertTriangle, Trash2, X } from "lucide-react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  product: Product | null
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  product
}: DeleteConfirmModalProps) {
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white border border-rose-100 rounded-[1.5rem] w-full max-w-md shadow-2xl overflow-hidden p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-14 w-14 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-extrabold text-[#16422F]">Xác nhận xóa sản phẩm</h3>
        <p className="text-xs text-[#64716A] font-semibold mt-1">
          Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?
        </p>

        {/* Product Card Preview */}
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-left">
          <span className="text-2xl h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 border border-amber-200">
            {product.image}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-extrabold text-[#16422F] truncate">{product.name}</h4>
            <span className="text-2xs text-[#8E9B94] font-bold block">{product.id} · {product.sku} · {product.category}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-[#C6C0B0] hover:bg-slate-100 text-xs font-bold text-[#64716A] transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa sản phẩm</span>
          </button>
        </div>
      </div>
    </div>
  )
}
