export function generateProductId(sequenceNumber?: number): string {
  if (sequenceNumber !== undefined && sequenceNumber > 0) {
    return `PROD-${String(sequenceNumber).padStart(3, '0')}`
  }
  const randomSuffix = Math.floor(100 + Math.random() * 900)
  return `PROD-${randomSuffix}`
}

export function generateSKU(prefix: string = "SKU"): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `${prefix.toUpperCase()}-${randomNum}`
}

export function generateOrderId(prefix: string = "ORD"): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `${prefix.toUpperCase()}-${randomNum}`
}

export function formatPriceVND(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) {
    return "0đ"
  }
  return `${Number(price).toLocaleString('vi-VN')}đ`
}

export function formatDateISO(dateInput?: Date | string | null): string {
  if (!dateInput) {
    return new Date().toISOString().split('T')[0]
  }
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    if (isNaN(d.getTime())) {
      return new Date().toISOString().split('T')[0]
    }
    return d.toISOString().split('T')[0]
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

export function isImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false
  const raw = url.trim()
  if (!raw) return false
  return (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('/') ||
    raw.startsWith('data:') ||
    raw.includes('.') ||
    raw.includes('/')
  )
}

export function isEmoji(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false
  const raw = str.trim()
  return raw.length > 0 && raw.length <= 4 && !isImageUrl(raw)
}

export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ""
  const raw = url.trim()
  if (!raw) return ""
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
    return raw
  }
  if (isImageUrl(raw)) {
    return `https://${raw}`
  }
  return raw
}

/**
 * Extracts a human-readable string category name from a string or DetailedCategory object.
 */ 
export function getCategoryName(category?: any): string {
  if (!category) return ""
  if (typeof category === 'string') return category
  if (typeof category === 'object') {
    return category.name_vi || category.name_en || ""
  }
  return ""
}

