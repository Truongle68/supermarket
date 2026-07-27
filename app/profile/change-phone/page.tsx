'use client'

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/store/useAuthStore"
import { ArrowLeft, Loader2, Phone, CheckCircle, AlertCircle } from "lucide-react"
import userService from "@/lib/services/user.service"

function ChangePhoneForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { user, accessToken, refreshToken, login } = useAuth()

  const [newPhone, setNewPhone] = useState("")
  const [changePhoneToken, setChangePhoneToken] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      setChangePhoneToken(token)
    } else {
      setErrorMsg("Không tìm thấy mã xác thực (token). Vui lòng thực hiện xác thực từ trang Hồ sơ.")
    }
  }, [token])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPhone.trim()) return

    if (!changePhoneToken) {
      setErrorMsg("Thiếu token xác thực. Vui lòng thực hiện xác thực tài khoản từ trang Hồ sơ.")
      return
    }

    setErrorMsg("")
    setSuccessMsg("")
    setLoading(true)

    try {
      await userService.changePhone(newPhone.trim(), changePhoneToken)
      setOtpSent(true)
      setSuccessMsg(`Mã OTP xác thực đã được gửi đến số điện thoại: ${newPhone.trim()}`)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Có lỗi xảy ra khi gửi mã OTP.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg("Mã OTP phải gồm 6 chữ số")
      return
    }

    setErrorMsg("")
    setSuccessMsg("")
    setLoading(true)

    try {
      await userService.changePhoneConfirm({
        code: otpCode.trim(),
        phone: newPhone.trim()
      })
      setLoading(true)
      setSuccessMsg("Cập nhật số điện thoại thành công!")

      if (user && accessToken && refreshToken) {
        login({ ...user, phone: newPhone.trim() }, accessToken, refreshToken)
      }

      setTimeout(() => {
        router.push("/profile")
      }, 1000)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Mã OTP không đúng hoặc đã hết hạn.")
      setLoading(false)
    }
  }

  return (
    <div className="bg-white py-8 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10 w-full">
      {errorMsg && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg  && !otpSent && (
        <div className="space-y-6 text-center py-4">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 animate-bounce" />
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold">
            {successMsg}
          </div>
          <p className="text-2xs text-[#8E9B94] font-bold">Đang quay lại trang hồ sơ của bạn...</p>
        </div>
      )}

      {!otpSent ? (
        <form className="space-y-6" onSubmit={handleSendOtp}>
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-[#1E2522]">
              Số điện thoại mới
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                <Phone className="h-4 w-4" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs font-semibold transition-all"
                placeholder="Nhập số điện thoại mới (VD: 0987654321)"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !newPhone.trim()}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#12362C] focus:outline-none disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi mã...
                </>
              ) : (
                "Gửi mã OTP xác thực"
              )}
            </button>
          </div>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold">
              {successMsg}
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-xs font-bold text-[#1E2522]">
              Nhập mã OTP (6 chữ số) gửi đến: <span className="text-emerald-700">{newPhone}</span>
            </label>
            <div className="mt-2">
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="block w-full text-center tracking-[0.5em] text-lg font-bold py-3 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                placeholder="••••••"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false)
                setSuccessMsg("")
              }}
              disabled={loading}
              className="flex-1 py-3 px-4 border border-[#C6C0B0] hover:bg-neutral-50 text-[#5D6B63] font-bold rounded-2xl text-xs transition-all cursor-pointer"
            >
              Nhập số khác
            </button>
            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#12362C] focus:outline-none disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xác nhận...
                </>
              ) : (
                "Xác nhận cập nhật"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function ChangePhonePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-emerald-100 selection:text-emerald-950">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#E8E2D2_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

      <div className="absolute top-8 left-8 z-10">
        <Link 
          href="/profile" 
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64716A] hover:text-[#16422F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Hồ sơ cá nhân</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="flex justify-center select-none">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-4xl font-extrabold tracking-tight text-[#16422F]">Tươi</span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-3"></span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#16422F]">
          Cập nhật Số điện thoại
        </h2>
        <p className="mt-2 text-center text-xs text-[#64716A] font-semibold">
          Hoàn tất thay đổi thông tin số điện thoại của bạn.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <Suspense fallback={
          <div className="bg-white py-8 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10 flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B4D3E]" />
            <p className="text-xs font-bold mt-3 text-[#64716A]">Đang xử lý yêu cầu...</p>
          </div>
        }>
          <ChangePhoneForm />
        </Suspense>
      </div>
    </div>
  )
}
