'use client'

import { Search, Plus, Eye, EyeOff, Edit3, Trash2, Package, Loader2 } from "lucide-react"
import { Product } from "@/lib/store/useProductStore"
import { formatPriceVND, getCategoryName } from "@/lib/utils"
import { ProductThumbnail } from "./ProductThumbnail"

interface AdminProductsTableProps {
  products: Product[]
  categories: string[]
  productSearch: string
  setProductSearch: (s: string) => void
  categoryFilter: string
  setCategoryFilter: (c: string) => void
  statusFilter: string
  setStatusFilter: (s: string) => void
  onAddClick: () => void
  onEditClick: (product: Product) => void
  onDeleteClick: (product: Product) => void
  onToggleStatus: (id: string) => void
  isLoading?: boolean
}

export function AdminProductsTable({
  products,
  categories,
  productSearch,
  setProductSearch,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onToggleStatus,
  isLoading = false,
}: AdminProductsTableProps) {
  // Filter products based on status and optional client search
  const filteredProducts = products.filter((item) => {
    const matchesSearch = 
      !productSearch.trim() ||
      item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      item.id.toLowerCase().includes(productSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(productSearch.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm space-y-6">
      {/* Header Controls & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F3EFE6]">
        <div>
          <h3 className="text-lg font-extrabold text-[#16422F]">Danh sách sản phẩm</h3>
          <p className="text-xs text-[#64716A] font-semibold mt-0.5">
            Tìm kiếm, lọc, chỉnh sửa hoặc cập nhật số lượng tồn kho trực tiếp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60 min-w-[200px]">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#8E9B94]" />
            <input
              type="text"
              placeholder="Tìm theo tên, ID, SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#C6C0B0] bg-[#FDFBF7] rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2] transition-all"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 border border-[#C6C0B0] bg-[#FDFBF7] rounded-full text-xs font-bold text-[#1E2522] focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 cursor-pointer"
          >
            <option value="all">Tất cả danh mục ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 border border-[#C6C0B0] bg-[#FDFBF7] rounded-full text-xs font-bold text-[#1E2522] focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">🟢 Đang kinh doanh</option>
            <option value="out_of_stock">🔴 Hết hàng</option>
            <option value="hidden">⚪ Tạm ẩn</option>
          </select>

          {/* Add Product Button */}
          <button
            onClick={onAddClick}
            className="px-4 py-2 bg-[#1DA1F2] hover:bg-[#1A91DA] text-white text-xs font-extrabold rounded-full flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm SP</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#8E9B94]">
          <Loader2 className="w-8 h-8 text-[#1DA1F2] animate-spin mb-2" />
          <span className="text-xs font-bold">Đang tải danh sách sản phẩm...</span>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-[#F3EFE6]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF6EC] border-b border-[#EDE7D9] text-2xs font-extrabold uppercase tracking-wider text-[#8E9B94]">
                <th className="py-3.5 px-4">Sản phẩm</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4 text-right">Giá bán</th>
                <th className="py-3.5 px-4 text-center">Tồn kho</th>
                <th className="py-3.5 px-4 text-center">Nhãn</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EFE6] bg-white">
              {filteredProducts.map((item) => (
                <tr key={item.id} className="text-xs hover:bg-[#FAF6EC]/30 transition-all">
                  
                  {/* Product Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <ProductThumbnail image={item.image} name={item.name} />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-[#16422F] text-xs truncate max-w-[200px]">{item.name}</h4>
                        <div className="flex items-center gap-2 text-2xs text-[#8E9B94] font-semibold mt-0.5">
                          <span>{item.id}</span>
                          <span>·</span>
                          <span>{item.sku}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-2xs font-bold border border-slate-200">
                      {getCategoryName(item.category) || "Chưa phân loại"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-extrabold text-emerald-700 block">
                      {formatPriceVND(item.price)}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-2xs text-[#8E9B94] line-through font-bold block mt-0.5">
                        {formatPriceVND(item.originalPrice)}
                      </span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={`font-extrabold text-xs ${
                        item.stock === 0 ? "text-rose-600" : item.stock <= 10 ? "text-amber-600" : "text-[#16422F]"
                      }`}>
                        {item.stock} {item.unit}
                      </span>
                    </div>
                  </td>

                  {/* Badge */}
                  <td className="py-3.5 px-4 text-center">
                    {item.badge ? (
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-2xs font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="text-2xs text-slate-300 font-semibold">-</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-extrabold ${
                      item.status === 'active' 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : item.status === 'out_of_stock'
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        item.status === 'active' ? "bg-emerald-500" : item.status === 'out_of_stock' ? "bg-rose-500" : "bg-slate-400"
                      }`}></span>
                      {item.status === 'active' ? "Kinh doanh" : item.status === 'out_of_stock' ? "Hết hàng" : "Đã ẩn"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onToggleStatus(item.id)}
                        className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
                        title={item.status === 'hidden' ? "Hiện sản phẩm" : "Ẩn sản phẩm"}
                      >
                        {item.status === 'hidden' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => onEditClick(item)}
                        className="h-8 w-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1DA1F2] flex items-center justify-center transition-all cursor-pointer"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteClick(item)}
                        className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-[#FAF6EC]/40 border border-dashed border-[#C6C0B0] rounded-2xl">
          <Package className="w-12 h-12 text-[#8E9B94] mx-auto mb-3" />
          <h4 className="text-sm font-extrabold text-[#16422F]">Không tìm thấy sản phẩm phù hợp</h4>
          <p className="text-xs text-[#64716A] font-semibold mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác.</p>
          <button
            onClick={() => {
              setProductSearch("")
              setCategoryFilter("all")
              setStatusFilter("all")
            }}
            className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold rounded-full transition-all cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </div>
  )
}
