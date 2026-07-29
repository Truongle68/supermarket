'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useMutation } from "@tanstack/react-query"
import { authService } from "@/lib/services/auth.service"
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react"
import getVietnameseErrorMessage from "@/lib/utils/errorMapper"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const data = await authService.forgotPassword(email);
      return data.data
    },
    onSuccess: () => {
      toast.success("Yêu cầu khôi phục mật khẩu đã được gửi thành công!")
      setSuccessMsg("Yêu cầu khôi phục mật khẩu đã được gửi thành công! Vui lòng kiểm tra hộp thư của bạn.")
      setCooldown(60)
    },
    onError: (err: any) => {
      const msg = getVietnameseErrorMessage(err, "Không thể thực hiện yêu cầu. Vui lòng kiểm tra lại email.")
      toast.error(msg)
      setErrorMsg(msg)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")
    forgotPasswordMutation.mutate()
  }

  const handleResend = () => {
    setErrorMsg("")
    setSuccessMsg("")
    forgotPasswordMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-emerald-100 selection:text-emerald-950">
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#E8E2D2_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

      <div className="absolute top-8 left-8 z-10">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm font-bold text-[#64716A] hover:text-[#16422F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay về trang đăng nhập</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center select-none">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-4xl font-extrabold tracking-tight text-[#16422F]">Tươi</span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-3"></span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#16422F]">
          Quên mật khẩu?
        </h2>
        <p className="mt-2 text-center text-sm text-[#64716A] font-semibold">
          Nhập email của bạn để nhận liên kết khôi phục mật khẩu.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10">

          {successMsg ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 animate-bounce" />
              </div>
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm font-semibold">
                {successMsg}
              </div>

              <div className="flex items-center justify-between text-xs font-semibold px-2">
                <span className="text-[#64716A]">Không nhận được email?</span>
                {cooldown > 0 ? (
                  <span className="text-[#8E9B94]">Gửi lại sau {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={forgotPasswordMutation.isPending}
                    className="text-emerald-700 font-extrabold hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Gửi lại email
                  </button>
                )}
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center py-3 px-4 border border-[#1B4D3E] rounded-2xl shadow-sm text-sm font-bold text-[#1B4D3E] hover:bg-[#FAF6EC] focus:outline-none transition-all cursor-pointer"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[#1E2522]">
                  Địa chỉ Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-sm font-medium transition-all"
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-[#1B4D3E] hover:bg-[#12362C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Gửi yêu cầu khôi phục"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
