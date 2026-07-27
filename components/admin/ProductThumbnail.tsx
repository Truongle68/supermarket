'use client'

import { useState } from "react"
import { Package } from "lucide-react"
import { normalizeImageUrl, isImageUrl, isEmoji } from "@/lib/utils"

interface ProductThumbnailProps {
  image?: string
  name?: string
  className?: string
}

export function ProductThumbnail({ image, name, className = "h-10 w-10" }: ProductThumbnailProps) {
  const [hasError, setHasError] = useState(false)

  const raw = image?.trim() || ""
  const normalized = normalizeImageUrl(raw)
  const isUrl = isImageUrl(raw)
  const isEmojiChar = isEmoji(raw)

  if (isUrl && !hasError) {
    return (
      <div className={`${className} rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={normalized}
          alt={name || "Sản phẩm"}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    )
  }

  if (isEmojiChar) {
    return (
      <div className={`${className} rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0 shadow-sm select-none`}>
        {raw}
      </div>
    )
  }

  return (
    <div className={`${className} rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm select-none text-slate-400`}>
      <Package className="w-5 h-5" />
    </div>
  )
}
