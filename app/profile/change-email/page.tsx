'use client'

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/store/useAuthStore"
import { ArrowLeft, Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react"
import userService from "@/lib/services/user.service"

function ChangeEmailForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const { user, accessToken, refreshToken, login } = useAuth()

  const [changeEmailToken, setChangeEmailToken] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [verifyingToken, setVerifyingToken] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Verify link token on mount
  useEffect(() => {
    if (!token) {
      setErrorMsg("Liên kết xác thực email không hợp lệ hoặc đã hết hạn.")
      setVerifyingToken(false)
      return
    }

    const checkToken = async () => {
      try {
        const res = await userService.confirmEmailLink(token)
        const data = res.data
        if (data?.change_email_token) {
          setChangeEmailToken(data.change_email_token)
        } else {
          setSuccessMsg("Địa chỉ Email của bạn đã được xác thực thành công!")
          setTimeout(() => {
            router.push("/profile")
          }, 2500)
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || err.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.")
      } finally {
        setVerifyingToken(false)
      }
    }

    checkToken()
  }, [token, router])

  // Step 1: Send OTP to new email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim() || !changeEmailToken) return

    setErrorMsg("")
    setSuccessMsg("")
    setSubmitting(true)

    try {
      await userService.changeEmail({
        change_email_token: changeEmailToken,
        identifier: newEmail.trim()
      })
      setOtpSent(true)
      setSuccessMsg(`Mã OTP đã được gửi tới email mới: ${newEmail.trim()}. Vui lòng kiểm tra hộp thư!`)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Có lỗi xảy ra khi gửi mã OTP tới email mới.")
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2: Verify OTP code and complete email change
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg("Mã OTP phải gồm 6 chữ số")
      return
    }

    setErrorMsg("")
    setSuccessMsg("")
    setSubmitting(true)

    try {
      await userService.changeEmailConfirm({
        code: otpCode,
        identifier: newEmail.trim()
      })
      setSuccessMsg("Cập nhật địa chỉ Email mới thành công!")

      if (user && accessToken && refreshToken) {
        login({ ...user, email: newEmail.trim() }, accessToken, refreshToken)
      }

      setTimeout(() => {
        router.push("/profile")
      }, 1000)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Mã OTP không đúng hoặc đã hết hạn.")
      setSubmitting(false)
    }
  }

  if (verifyingToken) {
    return (
      <div className="bg-white py-12 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10 flex flex-col items-center justify-center min-h-[220px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4D3E]" />
        <p className="text-xs font-bold mt-4 text-[#64716A]">Đang xác thực liên kết...</p>
      </div>
    )
  }

  return (
    <div className="bg-white py-8 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10 w-full">
      {errorMsg && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && !otpSent && (
        <div className="space-y-6 text-center py-4">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 animate-bounce" />
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold">
            {successMsg}
          </div>
          <p className="text-2xs text-[#8E9B94] font-bold">Đang chuyển hướng về trang hồ sơ cá nhân...</p>
        </div>
      )}

      {changeEmailToken && !otpSent && (
        <form className="space-y-6" onSubmit={handleSendOtp}>
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-[#1E2522]">
              Địa chỉ Email mới
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs font-semibold transition-all"
                placeholder="Nhập địa chỉ email mới (VD: newemail@example.com)"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting || !newEmail.trim()}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#12362C] focus:outline-none disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi OTP...
                </>
              ) : (
                "Gửi mã OTP xác thực tới Email mới"
              )}
            </button>
          </div>
        </form>
      )}

      {changeEmailToken && otpSent && (
        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold">
              {successMsg}
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-xs font-bold text-[#1E2522]">
              Nhập mã OTP (6 chữ số) gửi tới: <span className="text-emerald-700">{newEmail}</span>
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
              onClick={() => setOtpSent(false)}
              disabled={submitting}
              className="flex-1 py-3 px-4 border border-[#C6C0B0] hover:bg-neutral-50 text-[#5D6B63] font-bold rounded-2xl text-xs transition-all cursor-pointer"
            >
              Đổi email khác
            </button>
            <button
              type="submit"
              disabled={submitting || otpCode.length !== 6}
              className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#12362C] focus:outline-none disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Xác nhận đổi Email"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function ChangeEmailPage() {
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
          Xác thực / Thay đổi Email
        </h2>
        <p className="mt-2 text-center text-xs text-[#64716A] font-semibold">
          Hoàn tất việc xác thực hoặc đổi email tài khoản của bạn.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <Suspense fallback={
          <div className="bg-white py-8 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10 flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B4D3E]" />
            <p className="text-xs font-bold mt-3 text-[#64716A]">Đang xử lý yêu cầu...</p>
          </div>
        }>
          <ChangeEmailForm />
        </Suspense>
      </div>
    </div>
  )
}
