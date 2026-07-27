'use client'

import { Truck, ShieldAlert, Award, Clock } from "lucide-react"

export function HomeFeatures() {
  const features = [
    {
      icon: Truck,
      title: "Giao hàng thần tốc",
      description: "Nhận hàng trong vòng 2 tiếng tại nội thành"
    },
    {
      icon: Award,
      title: "100% Hữu cơ chuẩn VietGAP",
      description: "Nguồn gốc xuất xứ rõ ràng từ các trang trại uy tín"
    },
    {
      icon: ShieldAlert,
      title: "Đổi trả dễ dàng",
      description: "Hoàn tiền 100% nếu sản phẩm dập nát hoặc không đạt chất lượng"
    },
    {
      icon: Clock,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng phục vụ"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-[#EBE6DA]">
      {features.map((item, index) => {
        const IconComponent = item.icon
        return (
          <div key={index} className="bg-white p-6 rounded-[1.5rem] border border-[#EBE6DA] shadow-sm flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#1E2522]">{item.title}</h4>
              <p className="text-2xs text-[#64716A] font-medium mt-1 leading-relaxed">{item.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
