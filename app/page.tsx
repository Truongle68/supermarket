'use client'

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/store/useAuthStore"
import { useProductStore, Product } from "@/lib/store/useProductStore"
import { Loader2, PackageSearch } from "lucide-react"

// Home Modular Components
import { HomeNavbar } from "@/components/home/HomeNavbar"
import { HomeHeroBanner } from "@/components/home/HomeHeroBanner"
import { CategoryBar } from "@/components/home/CategoryBar"
import { ProductCard } from "@/components/home/ProductCard"
import { HomeFeatures } from "@/components/home/HomeFeatures"
import { HomeFooter } from "@/components/home/HomeFooter"

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [cartCount, setCartCount] = useState(0)

  // Product Store
  const { 
    products, 
    categories, 
    isLoading, 
    fetchProductsFromApi,
    fetchCategoriesFromApi
  } = useProductStore()

  // Load API products & categories on mount
  useEffect(() => {
    fetchProductsFromApi().catch(console.error)
    fetchCategoriesFromApi().catch(console.error)
  }, [fetchProductsFromApi, fetchCategoriesFromApi])

  // Filter products by search & category
  const displayProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === "all" || prod.category === selectedCategory
    const matchesSearch = searchTerm.trim() === "" || 
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Add to cart handler
  const handleAddToCart = (product: Product) => {
    setCartCount((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased flex flex-col justify-between">
      
      <div>
        {/* Navigation Bar */}
        <HomeNavbar
          user={user}
          isAuthenticated={isAuthenticated}
          cartItemCount={cartCount}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onLogout={logout}
        />

        {/* Main Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          
          {/* Hero Banner Section */}
          <HomeHeroBanner />

          {/* Category Filter Pills Section */}
          <section id="products-section" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#16422F]">Danh mục sản phẩm</h2>
                <p className="text-xs text-[#64716A] font-semibold mt-1">Lựa chọn thực phẩm tươi ngon mỗi ngày theo từng nhóm hàng</p>
              </div>
            </div>

            <CategoryBar
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </section>

          {/* Product Grid Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#16422F]">
                {selectedCategory === "all" ? "Tất cả sản phẩm" : selectedCategory}
                <span className="text-xs font-bold text-[#8E9B94] ml-2 font-sans">
                  ({displayProducts.length} sản phẩm)
                </span>
              </h2>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-[#8E9B94]">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                <span className="text-xs font-bold">Đang tải danh sách sản phẩm...</span>
              </div>
            ) : displayProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#FAF6EC]/60 border border-dashed border-[#C6C0B0] rounded-[2rem]">
                <PackageSearch className="w-12 h-12 text-[#8E9B94] mx-auto mb-3" />
                <h3 className="text-base font-extrabold text-[#16422F]">Không tìm thấy sản phẩm nào</h3>
                <p className="text-xs text-[#64716A] font-semibold mt-1">
                  Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục sản phẩm khác.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all")
                    setSearchTerm("")
                  }}
                  className="mt-4 px-5 py-2.5 bg-[#1B4D3E] text-white text-xs font-extrabold rounded-full hover:bg-[#16422F] transition-all cursor-pointer"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            )}
          </section>

          {/* Trust Features Section */}
          <HomeFeatures />

        </main>
      </div>

      {/* Footer Section */}
      <HomeFooter />

    </div>
  )
}
