import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  price: number
  originalPrice: number
  stock: number
  unit: string
  image: string
  badge: string
  status: 'active' | 'out_of_stock' | 'hidden'
  description?: string
  salesCount: number
  createdAt: string
}

interface ProductStore {
  products: Product[]
  categories: string[]
  addProduct: (product: Omit<Product, 'id' | 'sku' | 'salesCount' | 'createdAt'>) => void
  updateProduct: (id: string, productData: Partial<Product>) => void
  deleteProduct: (id: string) => void
  toggleProductStatus: (id: string) => void
}

const INITIAL_CATEGORIES = [
  "Rau củ hữu cơ",
  "Trái cây tươi",
  "Thịt & Thủy sản",
  "Sữa & Trứng",
  "Đồ uống & Trà",
  "Gia vị & Khô"
]

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "PROD-001",
    sku: "SKU-89301",
    name: "Bơ sáp Đắc Lắk",
    category: "Trái cây tươi",
    price: 45000,
    originalPrice: 60000,
    stock: 42,
    unit: "kg",
    image: "🥑",
    badge: "Khuyến mãi",
    status: "active",
    description: "Bơ sáp dẻo ngậy, hái tại vườn Đắk Lắk, không sử dụng thuốc bảo vệ thực vật.",
    salesCount: 156,
    createdAt: "2026-07-01"
  },
  {
    id: "PROD-002",
    sku: "SKU-89302",
    name: "Cà chua bi hữu cơ",
    category: "Rau củ hữu cơ",
    price: 28000,
    originalPrice: 35000,
    stock: 18,
    unit: "hộp 500g",
    image: "🍅",
    badge: "Hái mới",
    status: "active",
    description: "Cà chua bi giòn ngọt chuẩn hữu cơ Đà Lạt.",
    salesCount: 230,
    createdAt: "2026-07-05"
  },
  {
    id: "PROD-003",
    sku: "SKU-89303",
    name: "Rau muống nước sạch",
    category: "Rau củ hữu cơ",
    price: 12000,
    originalPrice: 15000,
    stock: 5,
    unit: "bó",
    image: "🥬",
    badge: "Bán chạy",
    status: "active",
    description: "Rau muống thủy canh sạch, cọng mập giòn.",
    salesCount: 410,
    createdAt: "2026-07-10"
  },
  {
    id: "PROD-004",
    sku: "SKU-89304",
    name: "Táo Envy nhập khẩu",
    category: "Trái cây tươi",
    price: 89000,
    originalPrice: 110000,
    stock: 0,
    unit: "kg",
    image: "🍎",
    badge: "Đặc biệt",
    status: "out_of_stock",
    description: "Táo Envy New Zealand nhập khẩu chuẩn ngạch, ngọt đậm đậm đà.",
    salesCount: 98,
    createdAt: "2026-07-08"
  },
  {
    id: "PROD-005",
    sku: "SKU-89305",
    name: "Thịt ba chỉ bò Mỹ",
    category: "Thịt & Thủy sản",
    price: 135000,
    originalPrice: 160000,
    stock: 25,
    unit: "khay 500g",
    image: "🥩",
    badge: "Khuyến mãi",
    status: "active",
    description: "Thịt ba chỉ bò Mỹ đông lạnh cắt lát mỏng thích hợp ăn lẩu, nướng.",
    salesCount: 185,
    createdAt: "2026-07-12"
  },
  {
    id: "PROD-006",
    sku: "SKU-89306",
    name: "Trứng gà tươi OMEGA-3",
    category: "Sữa & Trứng",
    price: 38000,
    originalPrice: 42000,
    stock: 60,
    unit: "hộp 10 quả",
    image: "🥚",
    badge: "Bán chạy",
    status: "active",
    description: "Trứng gà nuôi thảo dược giàu Omega 3 và các vi chất dinh dưỡng.",
    salesCount: 320,
    createdAt: "2026-07-15"
  },
  {
    id: "PROD-007",
    sku: "SKU-89307",
    name: "Trà sữa Ô Long kem béo",
    category: "Đồ uống & Trà",
    price: 32000,
    originalPrice: 40000,
    stock: 0,
    unit: "chai 500ml",
    image: "🥤",
    badge: "",
    status: "out_of_stock",
    description: "Trà sữa đóng chai tươi trong ngày đậm vị trà Ô Long Lâm Đồng.",
    salesCount: 142,
    createdAt: "2026-07-14"
  },
  {
    id: "PROD-008",
    sku: "SKU-89308",
    name: "Nước mắm cá cơm Phú Quốc",
    category: "Gia vị & Khô",
    price: 75000,
    originalPrice: 85000,
    stock: 12,
    unit: "chai 500ml",
    image: "🧂",
    badge: "Đặc biệt",
    status: "active",
    description: "Nước mắm truyền thống 40 độ đạm nguyên chất đậm đà.",
    salesCount: 88,
    createdAt: "2026-07-02"
  }
]

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,

      addProduct: (newProductData) => {
        set((state) => {
          const newIdNumber = state.products.length + 1
          const id = `PROD-${String(newIdNumber).padStart(3, '0')}`
          const sku = `SKU-${Math.floor(10000 + Math.random() * 90000)}`
          
          const newProduct: Product = {
            ...newProductData,
            id,
            sku,
            salesCount: 0,
            createdAt: new Date().toISOString().split('T')[0]
          }

          return {
            products: [newProduct, ...state.products]
          }
        })
      },

      updateProduct: (id, updatedFields) => {
        set((state) => ({
          products: state.products.map((item) => {
            if (item.id === id) {
              const updatedStock = updatedFields.stock !== undefined ? updatedFields.stock : item.stock
              let autoStatus = updatedFields.status || item.status
              
              // Auto-sync out_of_stock status if stock drops to 0
              if (updatedStock === 0 && autoStatus === 'active') {
                autoStatus = 'out_of_stock'
              } else if (updatedStock > 0 && autoStatus === 'out_of_stock') {
                autoStatus = 'active'
              }

              return {
                ...item,
                ...updatedFields,
                status: autoStatus
              }
            }
            return item
          })
        }))
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((item) => item.id !== id)
        }))
      },

      toggleProductStatus: (id) => {
        set((state) => ({
          products: state.products.map((item) => {
            if (item.id === id) {
              const nextStatus = item.status === 'active' 
                ? (item.stock === 0 ? 'out_of_stock' : 'hidden')
                : (item.status === 'hidden' ? (item.stock === 0 ? 'out_of_stock' : 'active') : 'active')
              return { ...item, status: nextStatus }
            }
            return item
          })
        }))
      }
    }),
    {
      name: 'supermarket-admin-products'
    }
  )
)
