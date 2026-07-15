'use client'

import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/store/useAuthStore"
import { useRouter } from "next/navigation"
import { 
  User, 
  ShoppingCart, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Leaf,
  LogOut,
  Settings
} from "lucide-react"

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const categories = [
    { id: 1, name: "Rau củ hữu cơ", count: "45+ sản phẩm", icon: "🥦", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { id: 2, name: "Trái cây tươi", count: "32+ sản phẩm", icon: "🍎", color: "bg-amber-50 text-amber-700 border-amber-100" },
    { id: 3, name: "Thịt & Thủy sản", count: "28+ sản phẩm", icon: "🥩", color: "bg-rose-50 text-rose-700 border-rose-100" },
    { id: 4, name: "Sữa & Trứng", count: "18+ sản phẩm", icon: "🥚", color: "bg-blue-50 text-blue-700 border-blue-100" },
    { id: 5, name: "Đồ uống & Trà", count: "24+ sản phẩm", icon: "🥤", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    { id: 6, name: "Gia vị & Khô", count: "40+ sản phẩm", icon: "🧂", color: "bg-orange-50 text-orange-700 border-orange-100" },
  ]

  const featuredProducts = [
    { id: 1, name: "Bơ sáp Đắk Lắk", price: "45.000đ", originalPrice: "60.000đ", image: "🥑", badge: "Khuyến mãi" },
    { id: 2, name: "Cà chua bi hữu cơ", price: "28.000đ", originalPrice: "35.000đ", image: "🍅", badge: "Hái mới" },
    { id: 3, name: "Rau muống nước sạch", price: "12.000đ", originalPrice: "15.000đ", image: "🥬", badge: "Bán chạy" },
    { id: 4, name: "Táo Envy nhập khẩu", price: "89.000đ", originalPrice: "110.000đ", image: "🍎", badge: "Đặc biệt" }
  ]

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased selection:bg-emerald-100 selection:text-emerald-950">
      {/* Promo Bar */}
      <div className="bg-[#1C201E] text-[#DCE2DE] py-2.5 px-4 text-center text-xs font-medium tracking-wide">
        Miễn phí giao hàng cho đơn từ 300.000đ · Giao nhanh trong 2 giờ nội thành
      </div>

      {/* Navigation */}
      <header className="border-b border-[#F3EFE6] bg-[#FDFBF7]/90 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-1.5 select-none">
              <span className="text-3xl font-extrabold tracking-tight text-[#16422F]">Tươi</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 mt-2.5"></span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <Link 
                href="/" 
                className="bg-[#E4EDE7] text-[#16422F] font-semibold px-4.5 py-2 rounded-full text-sm"
              >
                Trang chủ
              </Link>
              <Link 
                href="#san-pham" 
                className="text-[#64716A] hover:text-[#16422F] font-semibold px-4.5 py-2 rounded-full text-sm transition-colors"
              >
                Sản phẩm
              </Link>
              <Link 
                href="#lien-he" 
                className="text-[#64716A] hover:text-[#16422F] font-semibold px-4.5 py-2 rounded-full text-sm transition-colors"
              >
                Về chúng tôi
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="h-10 px-4 rounded-full border border-[#EBE6DA] hover:bg-white text-sm font-bold transition-all">
              EN
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link 
                  href={user.role === 'admin' ? '/admin' : '/profile'}
                  className="h-10 px-4.5 rounded-full border border-[#EBE6DA] hover:border-emerald-600 bg-white shadow-sm hover:shadow text-sm font-bold flex items-center gap-2 transition-all"
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="max-w-[120px] truncate text-[#16422F]">
                    {user.name} {user.role === 'admin' && '(Admin)'}
                  </span>
                </Link>
                
                {user.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="h-10 w-10 flex items-center justify-center rounded-full border border-[#EBE6DA] hover:bg-white text-[#64716A] transition-all hover:text-blue-500"
                    title="Trang quản trị"
                  >
                    <Settings className="w-4.5 h-4.5" />
                  </Link>
                ) : null}

                <button 
                  onClick={() => {
                    logout()
                    router.refresh()
                  }}
                  className="h-10 w-10 flex items-center justify-center rounded-full border border-[#EBE6DA] hover:bg-rose-50 text-[#64716A] hover:text-rose-600 transition-all"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="h-10 px-4.5 rounded-full border border-[#EBE6DA] hover:border-emerald-600 hover:bg-white text-sm font-bold flex items-center gap-2 transition-all"
              >
                <User className="w-4 h-4 text-[#64716A]" />
                <span>Đăng nhập</span>
              </Link>
            )}

            <button className="h-10 px-5 rounded-full bg-[#1C201E] text-white hover:bg-black text-sm font-bold flex items-center gap-2 shadow-sm transition-all">
              <ShoppingCart className="w-4.5 h-4.5" />
              <span>Giỏ hàng</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section Container */}
        <section className="bg-[#FAF6EC] border border-[#EDE7D9] rounded-[2.5rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden shadow-sm">
          
          {/* Light background grids */}
          <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#E8E2D2_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

          {/* Left content */}
          <div className="flex-1 z-10 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-[#E3ECE6] text-[#1E5D3B] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border border-[#D5E4D9]">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Giao nhanh trong 2 giờ
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#16422F] leading-[1.1] mt-8 mb-5 max-w-xl">
              Đồ tươi ngon, giao tận bếp mỗi ngày
            </h1>

            <p className="text-[#55635C] text-lg font-medium mb-10 max-w-lg leading-relaxed">
              Rau củ, trái cây, thịt cá tuyển chọn từ nông trại xanh — đặt hôm nay, nhận trong ngày, an tâm từng bữa ăn.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="#san-pham"
                className="w-full sm:w-auto text-center h-13 px-8 bg-[#1B4D3E] hover:bg-[#12362C] text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Mua sắm ngay</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="w-full sm:w-auto h-13 px-8 border border-[#C6C0B0] text-[#16422F] hover:bg-[#FAF6EC]/70 font-bold rounded-full transition-all">
                Xem khuyến mãi
              </button>
            </div>
          </div>

          {/* Right graphic content */}
          <div className="flex-1 w-full flex justify-center relative">
            <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] bg-[#E3EFE6] rounded-[2rem] relative overflow-hidden border border-[#D0E2D5] flex items-center justify-center shadow-inner">
              
              {/* Stripe Background Effect */}
              <div className="absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(45deg,#000,#000_10px,transparent_10px,transparent_20px)]"></div>
              
              <Image 
                src="/fresh-basket.png" 
                alt="Rau củ quả tươi"
                width={360}
                height={360}
                className="object-contain hover:scale-105 transition-transform duration-500"
                priority
              />

              {/* Floating Badge */}
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-sm border border-[#E1EDE4] rounded-2xl p-4 flex items-center gap-3 shadow-md">
                <div className="h-10 w-10 rounded-full bg-[#1B4D3E] flex items-center justify-center text-white shrink-0">
                  <Leaf className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#16422F]">Tươi mỗi ngày</h4>
                  <p className="text-xs text-[#5D6B63] font-semibold">Hái trực tiếp & giao nhanh trong 24h</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="danh-muc" className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16422F] tracking-tight">Danh mục sản phẩm</h2>
              <p className="text-[#64716A] text-sm mt-1">Lựa chọn thực phẩm sạch, an toàn cho gia đình bạn</p>
            </div>
            <Link 
              href="#san-pham" 
              className="text-[#1B4D3E] hover:text-[#12362C] text-sm font-bold flex items-center gap-1 group"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className={`border rounded-3xl p-5 text-center flex flex-col items-center justify-center cursor-pointer hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md bg-white border-[#EBE6DA]`}
              >
                <span className="text-4xl mb-3.5 select-none">{cat.icon}</span>
                <h3 className="font-bold text-sm text-[#1E2522]">{cat.name}</h3>
                <span className="text-xs text-[#64716A] font-semibold mt-1">{cat.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section id="san-pham" className="mt-20 mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16422F] tracking-tight">Khuyến mãi cực hot 🔥</h2>
              <p className="text-[#64716A] text-sm mt-1">Sản phẩm tươi ngon ưu đãi sâu trong hôm nay</p>
            </div>
            <button className="text-sm font-bold text-[#64716A] hover:text-[#16422F] border border-[#EBE6DA] px-4 py-2 rounded-full hover:bg-white transition-all">
              Mới cập nhật
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <div 
                key={prod.id}
                className="bg-white border border-[#EBE6DA] rounded-[2rem] overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="h-48 bg-[#FAF6EC] flex items-center justify-center text-6xl relative select-none">
                  {prod.image}
                  <span className="absolute top-4 left-4 bg-emerald-600 text-white text-2xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">
                    {prod.badge}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-[#1E2522] group-hover:text-[#1B4D3E] transition-colors">{prod.name}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-emerald-700 font-extrabold text-lg">{prod.price}</span>
                      <span className="text-xs text-[#64716A] font-medium line-through">{prod.originalPrice}</span>
                      <span className="text-2xs text-[#64716A] font-medium">/ kg</span>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-2.5 bg-[#FAF6EC] hover:bg-[#1B4D3E] hover:text-white text-[#16422F] font-bold rounded-2xl text-sm transition-all">
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-[#1C201E] text-white rounded-[2.5rem] p-8 md:p-12 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="flex gap-4 items-start relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-emerald-900/50 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1.5">100% Hữu Cơ & Sạch</h3>
              <p className="text-sm text-[#9FA8A3] leading-relaxed">Nguồn cung cấp độc quyền từ các nông trại đạt chứng nhận Global GAP.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-emerald-900/50 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1.5">Giao Hàng Siêu Tốc 2h</h3>
              <p className="text-sm text-[#9FA8A3] leading-relaxed">Đội ngũ shipper riêng túc trực đảm bảo hàng tới nơi vẫn giữ trọn vẹn vị tươi.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-emerald-900/50 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1.5">Đổi Trả Dễ Dàng</h3>
              <p className="text-sm text-[#9FA8A3] leading-relaxed">Cam kết bồi hoàn hoặc đổi mới trong vòng 24h nếu chất lượng không như ý.</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer id="lien-he" className="bg-[#FAF6EC] border-t border-[#EDE7D9] py-16 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-1.5 select-none mb-4">
              <span className="text-2xl font-extrabold tracking-tight text-[#16422F]">Tươi</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 mt-2"></span>
            </div>
            <p className="text-[#64716A] text-sm leading-relaxed max-w-xs">
              Hệ thống bán lẻ thực phẩm sạch hữu cơ hàng đầu Việt Nam. Mang bữa ăn trọn vị và an toàn tới mọi gia đình.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#16422F] mb-4 uppercase tracking-wider">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm text-[#64716A] font-semibold">
              <li><Link href="#" className="hover:text-[#16422F]">Chính sách giao nhận</Link></li>
              <li><Link href="#" className="hover:text-[#16422F]">Phương thức thanh toán</Link></li>
              <li><Link href="#" className="hover:text-[#16422F]">Đổi trả & bồi hoàn</Link></li>
              <li><Link href="#" className="hover:text-[#16422F]">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#16422F] mb-4 uppercase tracking-wider">Về Tươi.</h4>
            <ul className="space-y-2 text-sm text-[#64716A] font-semibold">
              <li><Link href="#" className="hover:text-[#16422F]">Câu chuyện thương hiệu</Link></li>
              <li><Link href="#" className="hover:text-[#16422F]">Tuyển dụng đại sứ</Link></li>
              <li><Link href="#" className="hover:text-[#16422F]">Hệ thống cửa hàng</Link></li>
              <li><Link href="#" className="hover:text-[#16422F]">Liên hệ hợp tác</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#16422F] mb-4 uppercase tracking-wider">Địa chỉ liên hệ</h4>
            <address className="not-italic text-sm text-[#64716A] font-semibold space-y-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-4.5 h-4.5 text-emerald-700 shrink-0" />
                <span>123 Đường Láng, Đống Đa, Hà Nội</span>
              </p>
              <p>Hotline: 1900 6000 (8:00 - 21:00)</p>
              <p>Email: hotro@tuoi.vn</p>
            </address>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#EDE7D9] pt-8 mt-12 text-center text-xs text-[#8E9B94] font-semibold">
          © {new Date().getFullYear()} Tươi. All rights reserved. Designed for clean lifestyle.
        </div>
      </footer>
    </div>
  )
}
