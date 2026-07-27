import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import catalogService from '@/lib/services/catalog.service'
import {
  Category,
  CatalogProduct,
  CreateProductRequest,
  UpdateProductRequest,
  ListProductsQuery,
  SearchProductsQuery,
} from '@/lib/types'
import {
  generateProductId,
  generateSKU,
  formatDateISO,
  normalizeImageUrl
} from '@/lib/utils'

export interface Product {
  id: string
  sku: string
  name: string
  nameVi?: string
  nameEn?: string
  category: string
  categoryId?: string
  price: number
  originalPrice: number
  stock: number
  unit: string
  image: string
  badge: string
  status: 'active' | 'out_of_stock' | 'hidden'
  description?: string
  descriptionVi?: string
  descriptionEn?: string
  salesCount: number
  createdAt: string
}

export function mapCatalogProductToFrontend(
  bp: CatalogProduct,
  categoriesMap?: Record<string, string>
): Product {
  const categoryName = categoriesMap?.[bp.category_id] || bp.category_id || ""
  const isSale = bp.sale_price < bp.base_price
  const imageUrl = normalizeImageUrl(bp.images?.[0]?.url)

  return {
    id: bp.id,
    sku: bp.sku,
    name: bp.name_vi || bp.name_en || "",
    nameVi: bp.name_vi || "",
    nameEn: bp.name_en || "",
    category: categoryName,
    categoryId: bp.category_id,
    price: bp.sale_price || bp.base_price || 0,
    originalPrice: bp.base_price || bp.sale_price || 0,
    stock: 0,
    unit: bp.unit || "",
    image: imageUrl,
    badge: isSale ? "Khuyến mãi" : "",
    status: bp.is_active ? "active" : "hidden",
    description: bp.description_vi || bp.description_en || "",
    descriptionVi: bp.description_vi || "",
    descriptionEn: bp.description_en || "",
    salesCount: bp.rating_count || 0,
    createdAt: formatDateISO(bp.created_at),
  }
}

interface ProductStore {
  products: Product[]
  categories: string[]
  apiCategories: Category[]
  isLoading: boolean
  error: string | null

  // Synchronous / Local Actions
  addProduct: (product: Omit<Product, 'id' | 'salesCount' | 'createdAt'>) => void
  updateProduct: (id: string, productData: Partial<Product>) => void
  deleteProduct: (id: string) => void
  toggleProductStatus: (id: string) => void

  // Async API Actions
  fetchCategoriesFromApi: () => Promise<Category[]>
  fetchProductsFromApi: (params?: ListProductsQuery) => Promise<Product[]>
  searchProductsFromApi: (params?: SearchProductsQuery) => Promise<Product[]>
  createProductApi: (data: CreateProductRequest) => Promise<CatalogProduct | null>
  updateProductApi: (id: string, data: UpdateProductRequest) => Promise<CatalogProduct | null>
  deleteProductApi: (id: string) => Promise<boolean>
}

const INITIAL_CATEGORIES: string[] = []

const INITIAL_PRODUCTS: Product[] = []

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      apiCategories: [],
      isLoading: false,
      error: null,

      addProduct: (newProductData, apiCategoryId?: string) => {
        const productSku = newProductData.sku?.trim() || generateSKU()
        const primaryName = newProductData.nameVi || newProductData.name || newProductData.nameEn || ""

        set((state) => {
          const id = generateProductId(state.products.length + 1)
          const newProduct: Product = {
            ...newProductData,
            name: primaryName,
            id,
            sku: productSku,
            salesCount: 0,
            createdAt: formatDateISO()
          }

          return {
            products: [newProduct, ...state.products]
          }
        })

        // Also trigger API create in background if category ID is available
        const catId = apiCategoryId || get().apiCategories.find(c => c.name_vi === newProductData.category || c.name_en === newProductData.category)?.id
        if (catId) {
          get().createProductApi({
            category_id: catId,
            sku: productSku,
            name_vi: newProductData.nameVi || primaryName,
            name_en: newProductData.nameEn || primaryName,
            description_vi: newProductData.descriptionVi || newProductData.description || "",
            description_en: newProductData.descriptionEn || newProductData.description || "",
            unit: newProductData.unit,
            base_price: newProductData.originalPrice || newProductData.price,
            sale_price: newProductData.price,
            is_active: newProductData.status === 'active',
            images: newProductData.image ? [{ url: newProductData.image, sort_order: 1 }] : []
          }).catch(console.error)
        }
      },

      updateProduct: (id, updatedFields, apiCategoryId?: string) => {
        set((state) => ({
          products: state.products.map((item) => {
            if (item.id === id) {
              const updatedStock = updatedFields.stock !== undefined ? updatedFields.stock : item.stock
              let autoStatus = updatedFields.status || item.status

              if (updatedStock === 0 && autoStatus === 'active') {
                autoStatus = 'out_of_stock'
              } else if (updatedStock > 0 && autoStatus === 'out_of_stock') {
                autoStatus = 'active'
              }

              const primaryName = updatedFields.nameVi || updatedFields.name || updatedFields.nameEn || item.name

              return {
                ...item,
                ...updatedFields,
                name: primaryName,
                status: autoStatus
              }
            }
            return item
          })
        }))

        // Also trigger API update if this is an API product (UUID length > 10)
        if (id.length > 10) {
          const targetCategory = apiCategoryId || get().apiCategories.find(c => c.name_vi === updatedFields.category || c.name_en === updatedFields.category)?.id
          const payload: UpdateProductRequest = {}
          if (updatedFields.nameVi || updatedFields.name) payload.name_vi = updatedFields.nameVi || updatedFields.name;
          if (updatedFields.nameEn || updatedFields.name) payload.name_en = updatedFields.nameEn || updatedFields.name;
          if (updatedFields.descriptionVi || updatedFields.description) payload.description_vi = updatedFields.descriptionVi || updatedFields.description;
          if (updatedFields.descriptionEn || updatedFields.description) payload.description_en = updatedFields.descriptionEn || updatedFields.description;
          if (updatedFields.sku) payload.sku = updatedFields.sku;
          if (updatedFields.price !== undefined) payload.sale_price = updatedFields.price;
          if (updatedFields.originalPrice !== undefined) payload.base_price = updatedFields.originalPrice;
          if (updatedFields.unit !== undefined) payload.unit = updatedFields.unit;
          if (updatedFields.status !== undefined) payload.is_active = updatedFields.status === 'active';
          if (targetCategory) payload.category_id = targetCategory;
          if (updatedFields.image) payload.images = [{ url: updatedFields.image, sort_order: 1 }];

          if (Object.keys(payload).length > 0) {
            get().updateProductApi(id, payload).catch(console.error)
          }
        }
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((item) => item.id !== id)
        }))

        if (id.length > 10) {
          get().deleteProductApi(id).catch(console.error)
        }
      },

      toggleProductStatus: (id) => {
        set((state) => ({
          products: state.products.map((item) => {
            if (item.id === id) {
              const nextStatus = item.status === 'active'
                ? (item.stock === 0 ? 'out_of_stock' : 'hidden')
                : (item.status === 'hidden' ? (item.stock === 0 ? 'out_of_stock' : 'active') : 'active')

              if (id.length > 10) {
                get().updateProductApi(id, { is_active: nextStatus === 'active' }).catch(console.error)
              }

              return { ...item, status: nextStatus }
            }
            return item
          })
        }))
      },

      // API Actions
      fetchCategoriesFromApi: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await catalogService.listCategories()
          if (res.success && res.data) {
            const catNames = res.data.map(c => c.name_vi || c.name_en)
            set({
              apiCategories: res.data,
              categories: Array.from(new Set([...catNames, ...get().categories])),
              isLoading: false
            })
            return res.data
          }
        } catch (err: any) {
          set({ error: err.message || 'Failed to fetch categories', isLoading: false })
        }
        return []
      },

      fetchProductsFromApi: async (params?: ListProductsQuery) => {
        set({ isLoading: true, error: null })
        try {
          const currentApiCats = get().apiCategories
          const res = await catalogService.listProducts(params)
          if (res.success && res.data) {
            const catMap: Record<string, string> = {}
            currentApiCats.forEach(c => { catMap[c.id] = c.name_vi || c.name_en })
            const mappedProducts = res.data.map(p => mapCatalogProductToFrontend(p, catMap))
            set({ products: mappedProducts, isLoading: false })
            return mappedProducts
          }
        } catch (err: any) {
          set({ error: err.message || 'Failed to fetch products', isLoading: false })
        }
        return []
      },

      searchProductsFromApi: async (params?: SearchProductsQuery) => {
        set({ isLoading: true, error: null })
        try {
          let currentApiCats = get().apiCategories
          if (currentApiCats.length === 0) {
            currentApiCats = await get().fetchCategoriesFromApi()
          }
          const res = await catalogService.searchProducts(params)
          if (res.success && res.data?.products) {
            const catMap: Record<string, string> = {}
            currentApiCats.forEach(c => { catMap[c.id] = c.name_vi || c.name_en })
            const mappedProducts = res.data.products.map(p => mapCatalogProductToFrontend(p, catMap))
            set({ products: mappedProducts, isLoading: false })
            return mappedProducts
          }
        } catch (err: any) {
          set({ error: err.message || 'Failed to search products', isLoading: false })
        }
        return []
      },

      createProductApi: async (data: CreateProductRequest) => {
        set({ isLoading: true, error: null })
        try {
          const res = await catalogService.createProduct(data)
          if (res.success && res.data) {
            set({ isLoading: false })
            await get().fetchProductsFromApi()
            return res.data
          }
        } catch (err: any) {
          set({ error: err.message || 'Failed to create product', isLoading: false })
        }
        return null
      },

      updateProductApi: async (id: string, data: UpdateProductRequest) => {
        set({ isLoading: true, error: null })
        try {
          const res = await catalogService.updateProduct(id, data)
          if (res.success && res.data) {
            set({ isLoading: false })
            await get().fetchProductsFromApi()
            return res.data
          }
        } catch (err: any) {
          set({ error: err.message || 'Failed to update product', isLoading: false })
        }
        return null
      },

      deleteProductApi: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          const res = await catalogService.deleteProduct(id)
          if (res.success) {
            set({ isLoading: false })
            await get().fetchProductsFromApi()
            return true
          }
        } catch (err: any) {
          set({ error: err.message || 'Failed to delete product', isLoading: false })
        }
        return false
      }
    }),
    {
      name: 'supermarket-admin-products'
    }
  )
)
