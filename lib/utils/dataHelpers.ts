/**
 * Supermarket Application Data Helpers & Utility Generators
 * Ensures consistent, reusable formatting and data generation across stores and UI components.
 */

/**
 * Generates a consistent Product ID string (e.g. "PROD-001", "PROD-042").
 */
export function generateProductId(sequenceNumber?: number): string {
  if (sequenceNumber !== undefined && sequenceNumber > 0) {
    return `PROD-${String(sequenceNumber).padStart(3, '0')}`
  }
  const randomSuffix = Math.floor(100 + Math.random() * 900)
  return `PROD-${randomSuffix}`
}

/**
 * Generates a consistent SKU code string (e.g. "SKU-89301").
 */
export function generateSKU(prefix: string = "SKU"): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `${prefix.toUpperCase()}-${randomNum}`
}

/**
 * Generates a consistent Order ID string (e.g. "ORD-94827").
 */
export function generateOrderId(prefix: string = "ORD"): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `${prefix.toUpperCase()}-${randomNum}`
}

/**
 * Formats a number to Vietnamese Dong currency format (e.g. 45000 -> "45.000đ").
 */
export function formatPriceVND(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) {
    return "0đ"
  }
  return `${Number(price).toLocaleString('vi-VN')}đ`
}

/**
 * Formats a date into ISO Date string format (YYYY-MM-DD).
 */
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

/**
 * Checks if a given string represents an image URL or image file path.
 */
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

/**
 * Checks if a string represents a short emoji character.
 */
export function isEmoji(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false
  const raw = str.trim()
  return raw.length > 0 && raw.length <= 4 && !isImageUrl(raw)
}

/**
 * Normalizes an image URL string, automatically adding protocol if domain-only.
 */
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
