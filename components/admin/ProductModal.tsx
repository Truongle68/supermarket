'use client'

import { useState, useEffect } from "react"
import { Product } from "@/lib/store/useProductStore"
import { X, Tag, Package, DollarSign, Image as ImageIcon, Layers, FileText, Check, AlertCircle } from "lucide-react"

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (productData: any) => void
  initialData?: Product | null
  categories: string[]
}

const EMOJI_OPTIONS = ["🥦", "🍅", "🥬", "🍎", "🥑", "🥩", "🥚", "🥤", "🧂", "🌽", "🍊", "🥕", "🍇", "🧀", "🍞", "🌾", "🥛", "🍯", "🐟", "🍇"]
const BADGE_OPTIONS = ["", "Khuyến mãi", "Hái mới", "Bán chạy", "Đặc biệt"]
const UNIT_OPTIONS = ["kg", "hộp 500g", "khay 500g", "bó", "hộp 10 quả", "chai 500ml", "gói", "túi 1kg"]

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories
}: ProductModalProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [stock, setStock] = useState("")
  const [unit, setUnit] = useState("kg")
  const [customUnit, setCustomUnit] = useState("")
  const [image, setImage] = useState("🥦")
  const [badge, setBadge] = useState("")
  const [status, setStatus] = useState<'active' | 'out_of_stock' | 'hidden'>("active")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setCategory(initialData.category || categories[0] || "")
      setPrice(initialData.price ? String(initialData.price) : "")
      setOriginalPrice(initialData.originalPrice ? String(initialData.originalPrice) : "")
      setStock(initialData.stock !== undefined ? String(initialData.stock) : "")
      
      if (UNIT_OPTIONS.includes(initialData.unit)) {
        setUnit(initialData.unit)
        setCustomUnit("")
      } else {
        setUnit("custom")
        setCustomUnit(initialData.unit || "")
      }

      setImage(initialData.image || "🥦")
      setBadge(initialData.badge || "")
      setStatus(initialData.status || "active")
      setDescription(initialData.description || "")
    } else {
      setName("")
      setCategory(categories[0] || "")
      setPrice("")
      setOriginalPrice("")
      setStock("20")
      setUnit("kg")
      setCustomUnit("")
      setImage("🥦")
      setBadge("")
      setStatus("active")
      setDescription("")
    }
    setErrors({})
  }, [initialData, isOpen, categories])

  if (!isOpen) return null

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!name.trim()) newErrors.name = "Vui lòng nhập tên sản phẩm"
    if (!category) newErrors.category = "Vui lòng chọn danh mục"
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = "Giá bán phải là số lớn hơn 0"
    }
    if (originalPrice && (isNaN(Number(originalPrice)) || Number(originalPrice) < 0)) {
      newErrors.originalPrice = "Giá gốc hợp lệ"
    }
    if (stock === "" || isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = "Tồn kho phải là số không âm"
    }
    if (unit === "custom" && !customUnit.trim()) {
      newErrors.unit = "Vui lòng nhập đơn vị tính"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const finalUnit = unit === "custom" ? customUnit.trim() : unit
    const numPrice = Number(price)
    const numOriginal = originalPrice ? Number(originalPrice) : numPrice
    const numStock = Number(stock)

    let autoStatus = status
    if (numStock === 0 && status === "active") {
      autoStatus = "out_of_stock"
    }

    onSave({
      name: name.trim(),
      category,
      price: numPrice,
      originalPrice: numOriginal,
      stock: numStock,
      unit: finalUnit,
      image,
      badge,
      status: autoStatus,
      description: description.trim()
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#EBE6DA] rounded-[1.5rem] w-full max-w-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#FAF6EC] border-b border-[#EDE7D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-full flex items-center justify-center font-bold">
              {initialData ? "✏️" : "✨"}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#16422F]">
                {initialData ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <p className="text-xs text-[#64716A] font-semibold mt-0.5">
                {initialData ? `Mã SP: ${initialData.id} - ${initialData.sku}` : "Cập nhật thông tin hàng hóa trong hệ thống"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-white hover:bg-slate-200 border border-[#EBE6DA] flex items-center justify-center text-[#64716A] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Row 1: Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2522] mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#1DA1F2]" /> Tên sản phẩm *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Cà chua bi hữu cơ..."
                className={`w-full px-3.5 py-2.5 bg-[#FDFBF7] border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                  errors.name ? "border-rose-500 focus:ring-rose-200" : "border-[#C6C0B0] focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2]"
                }`}
              />
              {errors.name && <p className="text-2xs text-rose-600 font-bold mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2522] mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#1DA1F2]" /> Danh mục *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2] transition-all cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price & Original Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2522] mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Giá bán (VNĐ) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="VD: 45000"
                className={`w-full px-3.5 py-2.5 bg-[#FDFBF7] border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                  errors.price ? "border-rose-500 focus:ring-rose-200" : "border-[#C6C0B0] focus:ring-emerald-500/20 focus:border-emerald-600"
                }`}
              />
              {price && !isNaN(Number(price)) && (
                <span className="text-2xs text-emerald-700 font-extrabold mt-1 block">
                  Hiển thị: {Number(price).toLocaleString('vi-VN')}đ
                </span>
              )}
              {errors.price && <p className="text-2xs text-rose-600 font-bold mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2522] mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Giá gốc / Niêm yết (VNĐ)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="VD: 60000 (để trống nếu không giảm giá)"
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2] transition-all"
              />
              {originalPrice && !isNaN(Number(originalPrice)) && (
                <span className="text-2xs text-slate-500 line-through font-bold mt-1 block">
                  Hiển thị: {Number(originalPrice).toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
          </div>

          {/* Row 3: Stock & Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2522] mb-1.5 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-[#1DA1F2]" /> Số lượng tồn kho *
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="VD: 50"
                className={`w-full px-3.5 py-2.5 bg-[#FDFBF7] border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                  errors.stock ? "border-rose-500 focus:ring-rose-200" : "border-[#C6C0B0] focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2]"
                }`}
              />
              {errors.stock && <p className="text-2xs text-rose-600 font-bold mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2522] mb-1.5">Đơn vị tính *</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 cursor-pointer"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                  <option value="custom">Khác (tự nhập)...</option>
                </select>

                {unit === "custom" ? (
                  <input
                    type="text"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    placeholder="VD: chai 1L"
                    className="px-3 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20"
                  />
                ) : (
                  <div className="flex items-center px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-bold">
                    Đã chọn: {unit}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 4: Emoji & Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2522] mb-1.5 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-[#1DA1F2]" /> Biểu tượng / Emoji đại diện
              </label>
              <div className="flex items-center gap-2">
                <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                  {image}
                </div>
                <div className="flex-1 flex gap-1 overflow-x-auto p-1 bg-[#FDFBF7] border border-[#EBE6DA] rounded-xl">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setImage(emoji)}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-base hover:bg-amber-100 transition-all shrink-0 cursor-pointer ${
                        image === emoji ? "bg-amber-200 ring-2 ring-amber-400" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2522] mb-1.5">Nhãn nổi bật (Badge)</label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2] cursor-pointer"
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b || "-- Không gắn nhãn --"}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Status & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2522] mb-1.5">Trạng thái bán</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 cursor-pointer"
              >
                <option value="active">🟢 Đang kinh doanh (Active)</option>
                <option value="out_of_stock">🔴 Hết hàng (Out of Stock)</option>
                <option value="hidden">⚪ Tạm ẩn sản phẩm (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2522] mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" /> Mô tả ngắn
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Mô tả về nguồn gốc, hương vị, hướng dẫn bảo quản..."
                className="w-full px-3.5 py-2 bg-[#FDFBF7] border border-[#C6C0B0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#F3EFE6] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#C6C0B0] hover:bg-slate-100 text-xs font-bold text-[#64716A] transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#1DA1F2] hover:bg-[#1A91DA] text-white text-xs font-extrabold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? "Lưu thay đổi" : "Tạo sản phẩm"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
