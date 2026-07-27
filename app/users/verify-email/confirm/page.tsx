'use client'

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/store/useAuthStore"
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import userService from "@/lib/services/user.service"

function ConfirmEmailLinkContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const { user, accessToken, refreshToken, login } = useAuth()

  const [verifying, setVerifying] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    if (!token) {
      setErrorMsg("Liên kết xác thực email không hợp lệ hoặc đã hết hạn.")
      setVerifying(false)
      return
    }

    const confirmToken = async () => {
      try {
        const res = await userService.confirmEmailLink(token)
        const data = res.data

        if (data?.change_email_token) {
          // If purpose was verify_current_email, redirect to change-email form page immediately while keeping loader active
          router.replace(`/profile/change-email?token=${encodeURIComponent(token)}`)
          return
        }

        // If purpose was verify_new_email (verifying new/first email)
        if (accessToken) {
          try {
            const profileRes = await userService.getProfile()
            if (profileRes?.data && user) {
              login(
                {
                  ...user,
                  email: profileRes.data.email,
                  name: profileRes.data.full_name || user.name,
                },
                accessToken,
                refreshToken
              )
            }
          } catch (e) {
            // ignore profile fetch error
          }
        }

        setSuccessMsg("Địa chỉ Email của bạn đã được xác thực thành công!")
        setVerifying(false)
        
        // Fast redirect to profile page
        setTimeout(() => {
          router.replace("/profile")
        }, 1500)
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || err.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.")
        setVerifying(false)
      }
    }

    confirmToken()
  }, [token, router, accessToken, refreshToken, user, login])

  if (verifying) {
    return (
      <div className="bg-white py-12 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10 flex flex-col items-center justify-center min-h-[220px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4D3E]" />
        <p className="text-xs font-bold mt-4 text-[#64716A]">Đang xác thực liên kết Email...</p>
      </div>
    )
  }

  return (
    <div className="bg-white py-8 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10 w-full">
      {errorMsg ? (
        <div className="space-y-6 text-center py-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5 text-left">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center py-2.5 px-6 bg-[#1B4D3E] hover:bg-[#12362C] text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            Quay lại Hồ sơ cá nhân
          </Link>
        </div>
      ) : (
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
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-emerald-100 selection:text-emerald-950">
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
          Xác nhận Email
        </h2>
        <p className="mt-2 text-center text-xs text-[#64716A] font-semibold">
          Xác thực thông tin liên kết Email cho tài khoản của bạn.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <Suspense fallback={
          <div className="bg-white py-8 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10 flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B4D3E]" />
            <p className="text-xs font-bold mt-3 text-[#64716A]">Đang xử lý yêu cầu...</p>
          </div>
        }>
          <ConfirmEmailLinkContent />
        </Suspense>
      </div>
    </div>
  )
}
