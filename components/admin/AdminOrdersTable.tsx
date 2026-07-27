'use client'

import { Search, RefreshCw, ShoppingBag } from "lucide-react"

export interface AdminOrder {
  id: string
  customer: string
  email: string
  date: string
  total: string
  status: string
}

interface AdminOrdersTableProps {
  orders: AdminOrder[]
  isLoading: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export function AdminOrdersTable({
  orders,
  isLoading,
  searchTerm,
  setSearchTerm,
}: AdminOrdersTableProps) {
  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white border border-[#EBE6DA] rounded-[1.3rem] p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-extrabold text-[#16422F]">Quản lý đơn hàng</h3>
          <p className="text-xs text-[#64716A] font-semibold mt-0.5">Danh sách các đơn đặt hàng mới trên trang web.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8E9B94]" />
          <input
            type="text"
            placeholder="Tìm đơn hàng, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#C6C0B0] bg-[#FDFBF7] rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DA1F2]/20 focus:border-[#1DA1F2] transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8E9B94]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#1DA1F2] mb-2" />
          <span className="text-xs font-bold">Đang tải danh sách đơn hàng...</span>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F3EFE6] text-2xs font-extrabold uppercase tracking-wider text-[#8E9B94]">
                <th className="py-3 px-4">Mã đơn</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Ngày đặt</th>
                <th className="py-3 px-4">Tổng tiền</th>
                <th className="py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EFE6]">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="text-xs hover:bg-[#FAF6EC]/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-[#16422F]">{order.id}</td>
                  <td className="py-4 px-4 font-bold">
                    <div>{order.customer}</div>
                    <div className="text-2xs text-[#8E9B94] font-semibold">{order.email}</div>
                  </td>
                  <td className="py-4 px-4 text-[#64716A] font-semibold">{order.date}</td>
                  <td className="py-4 px-4 font-extrabold text-[#16422F]">{order.total}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-2xs font-extrabold ${
                      order.status === "Hoàn thành" 
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "Đang xử lý"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-[#FAF6EC]/40 border border-dashed border-[#C6C0B0] rounded-2xl">
          <ShoppingBag className="w-12 h-12 text-[#8E9B94] mx-auto mb-3" />
          <h4 className="text-sm font-extrabold text-[#16422F]">Chưa có đơn hàng nào</h4>
          <p className="text-xs text-[#64716A] font-semibold mt-1">Khi khách hàng đặt hàng trên ứng dụng, các đơn hàng sẽ xuất hiện ở đây.</p>
        </div>
      )}
    </div>
  )
}
