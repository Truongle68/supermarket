'use client'

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { authService } from "@/lib/services/auth.service"
import { ArrowLeft, Loader2, Lock, CheckCircle2 } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmedPassword, setConfirmedPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Sync token from URL query param if present
  useEffect(() => {
    const urlToken = searchParams.get("token")
    if (urlToken) {
      setToken(urlToken)
    }
  }, [searchParams])

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!token.trim()) {
        throw new Error("Mã xác thực token không được để trống")
      }
      if (newPassword.length < 8) {
        throw new Error("Mật khẩu mới phải chứa ít nhất 8 ký tự")
      }
      if (newPassword !== confirmedPassword) {
        throw new Error("Mật khẩu xác nhận không trùng khớp")
      }

      const data = await authService.resetPassword({
        token: token.trim(),
        new_password: newPassword,
        confirmed_password: confirmedPassword,
      });

      return data
    },
    onSuccess: () => {
      setSuccessMsg("Đổi mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...")
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại thông tin.")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")
    resetPasswordMutation.mutate()
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
          Đặt lại mật khẩu mới
        </h2>
        <p className="mt-2 text-center text-sm text-[#64716A] font-semibold">
          Nhập mật khẩu mới của bạn bên dưới để hoàn tất việc khôi phục tài khoản.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10">
          
          {errorMsg && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 animate-bounce" />
              </div>
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm font-semibold">
                {successMsg}
              </div>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-[#1B4D3E] hover:bg-[#12362C] transition-colors"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* New Password Input */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-bold text-[#1E2522]">
                  Mật khẩu mới
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-sm font-medium transition-all"
                    placeholder="Tối thiểu 8 ký tự"
                  />
                </div>
              </div>

              {/* Confirmed Password Input */}
              <div>
                <label htmlFor="confirmedPassword" className="block text-sm font-bold text-[#1E2522]">
                  Xác nhận mật khẩu mới
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirmedPassword"
                    name="confirmedPassword"
                    type="password"
                    required
                    value={confirmedPassword}
                    onChange={(e) => setConfirmedPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-sm font-medium transition-all"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-[#1B4D3E] hover:bg-[#12362C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang cập nhật mật khẩu...
                    </>
                  ) : (
                    "Đặt lại mật khẩu"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
