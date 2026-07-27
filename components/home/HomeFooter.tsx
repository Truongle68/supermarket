'use client'

import Link from "next/link"

export function HomeFooter() {
  return (
    <footer className="bg-[#16422F] text-emerald-100/80 border-t border-[#1B4D3E] py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div>
          <span className="text-3xl font-black text-white tracking-tight">
            Tươi<span className="text-emerald-400">.</span>
          </span>
          <p className="text-xs text-emerald-200/70 font-medium mt-3 leading-relaxed">
            Chuỗi siêu thị thực phẩm sạch hàng đầu, mang nông sản hữu cơ chất lượng cao tới mọi gia đình.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-extrabold text-white mb-3">Về chúng tôi</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link href="/" className="hover:text-white transition-colors">Giới thiệu siêu thị</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Hệ thống cửa hàng</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Chứng nhận chất lượng</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-extrabold text-white mb-3">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link href="/" className="hover:text-white transition-colors">Chính sách giao hàng</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors">Hướng dẫn thanh toán</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-extrabold text-white mb-3">Liên hệ</h4>
          <p className="text-xs font-medium leading-relaxed">
            Hotline: <strong className="text-white">1900 6868</strong><br />
            Email: <strong className="text-white">hotro@tuoi.vn</strong><br />
            Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-emerald-900/60 text-center text-2xs font-semibold text-emerald-300/60">
        © 2026 Tươi Supermarket. Bảo lưu mọi quyền.
      </div>
    </footer>
  )
}
