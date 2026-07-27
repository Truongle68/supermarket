'use client'

import { useState } from "react"
import { PackageSearch, ShoppingBag } from "lucide-react"
import { Product } from "@/lib/store/useProductStore"
import { formatPriceVND, normalizeImageUrl, isImageUrl, isEmoji } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

function ProductCardImage({ image, name }: { image?: string; name?: string }) {
  const [hasError, setHasError] = useState(false)

  const raw = image?.trim() || ""
  const normalized = normalizeImageUrl(raw)
  const isUrl = isImageUrl(raw)
  const isEmojiChar = isEmoji(raw)

  if (isUrl && !hasError) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={normalized}
        alt={name || "Sản phẩm"}
        className="w-full h-full object-contain max-h-36 p-4"
        onError={() => setHasError(true)}
      />
    )
  }

  if (isEmojiChar) {
    return (
      <span className="text-6xl select-none">{raw}</span>
    )
  }

  return (
    <PackageSearch className="w-12 h-12 text-[#8E9B94] opacity-40" />
  )
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div 
      className="bg-white border border-[#EBE6DA] rounded-[2rem] overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="h-48 bg-[#FAF6EC] flex items-center justify-center text-6xl relative select-none">
        <ProductCardImage image={product.image} name={product.name} />
        {product.badge ? (
          <span className="absolute top-4 left-4 bg-emerald-600 text-white text-2xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">
            {product.badge}
          </span>
        ) : null}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base text-[#1E2522] group-hover:text-[#1B4D3E] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-emerald-700 font-extrabold text-lg">
              {formatPriceVND(product.price)}
            </span>
            {product.originalPrice > product.price ? (
              <span className="text-xs text-[#64716A] font-medium line-through">
                {formatPriceVND(product.originalPrice)}
              </span>
            ) : null}
          </div>
          <p className="text-2xs text-[#8E9B94] font-semibold mt-1">
            Đơn vị: {product.unit || "phần"}
          </p>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className="mt-5 w-full py-3 bg-[#1B4D3E] hover:bg-[#16422F] text-white text-xs font-extrabold rounded-full flex items-center justify-center gap-2 shadow-md shadow-[#1B4D3E]/10 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Thêm vào giỏ hàng</span>
        </button>
      </div>
    </div>
  )
}
