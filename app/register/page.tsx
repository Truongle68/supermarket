'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { authService } from "@/lib/services/auth.service"
import { ArrowLeft, Loader2, Lock, User, Phone, KeyRound, Check, RefreshCw } from "lucide-react"
import { setTokens } from "@/lib/utils/tokenManager"
import { useAuth } from "@/lib/store/useAuthStore"
import userService from "@/lib/services/user.service"
import getVietnameseErrorMessage from "@/lib/utils/errorMapper"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  
  // Steps: 1 = Request OTP, 2 = Verify OTP, 3 = Complete Profile
  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  // Form fields
  const [phone, setPhone] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [verificationToken, setVerificationToken] = useState("")
  
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Cooldown timer for resending OTP (in seconds)
  const [cooldown, setCooldown] = useState(0)

  const [errorMsg, setErrorMsg] = useState("")
  const [isPhoneRegistered, setIsPhoneRegistered] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  // OTP Timer countdown effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Step 1: Request OTP Mutation
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false)
  const [usernameError, setUsernameError] = useState("")

  // Debounced Username check
  useEffect(() => {
    if (username.trim().length < 3) {
      setIsUsernameAvailable(null)
      setUsernameError("")
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setUsernameCheckLoading(true)
      setUsernameError("")
      try {
        const data = await authService.checkUsername(username.trim());
        setIsUsernameAvailable(data.data.available)
        if (!data.data.available) {
          setUsernameError("Tên đăng nhập này đã được sử dụng")
        }
      } catch (err: any) {
        setIsUsernameAvailable(null)
        setUsernameError(getVietnameseErrorMessage(err, "Lỗi kiểm tra tên đăng nhập"))
      } finally {
        setUsernameCheckLoading(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [username])

  // Step 1: Request OTP Mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (phoneNum: string) => {
      if (!/^\d{9,11}$/.test(phoneNum)) {
        throw new Error("Số điện thoại không hợp lệ (Phải từ 9-11 số)")
      }
      const data = await authService.requestOtp(phoneNum);
      return data;
    },
    onSuccess: (data) => {
      toast.success("Mã xác thực OTP đã được gửi!")
      setSuccessMsg(`Mã xác thực OTP đã được gửi!`)
      setStep(2)
      setCooldown(60) // Start 60s cooldown
    },
    onError: (err: any) => {
      const msg = getVietnameseErrorMessage(err, "Không thể gửi mã OTP. Vui lòng thử lại.")
      toast.error(msg)
      setErrorMsg(msg)
    }
  })

  // Step 2: Verify OTP Mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phoneNum, code }: { phoneNum: string; code: string }) => {
      if (!/^\d{6}$/.test(code)) {
        throw new Error("Mã OTP phải gồm 6 chữ số")
      }
      const data = await authService.verifyOtp(phoneNum, code);
      return data.data;
    },
    onSuccess: (data) => {
      setVerificationToken(data.verify_otp_token)
      if (data.user_exists) {
        setIsPhoneRegistered(true)
        const msg = `Số điện thoại này đã được đăng ký với tên tài khoản: ${data.username}`
        toast.error(msg)
        setErrorMsg(msg)
      } else {
        toast.success("Xác thực OTP thành công!")
        setSuccessMsg("Xác thực OTP thành công!")
        setTimeout(() => {
          setSuccessMsg("")
          setStep(3)
        }, 1000)
      }
    },
    onError: (err: any) => {
      const msg = getVietnameseErrorMessage(err, "Xác thực OTP thất bại.")
      toast.error(msg)
      setErrorMsg(msg)
    }
  })

  // Step 3: Complete Register Mutation
  const completeRegisterMutation = useMutation({
    mutationFn: async () => {
      if (fullName.trim().length < 2) {
        throw new Error("Họ và tên quá ngắn")
      }
      if (username.trim().length < 3) {
        throw new Error("Tên đăng nhập phải chứa ít nhất 3 ký tự")
      }
      if (isUsernameAvailable === false) {
        throw new Error("Tên đăng nhập đã được sử dụng")
      }
      if (password.length < 8) {
        throw new Error("Mật khẩu phải chứa ít nhất 8 ký tự")
      }
      if (password !== confirmPassword) {
        throw new Error("Mật khẩu xác nhận không khớp")
      }
      if (!verificationToken) {
        throw new Error("Thiếu token xác thực")
      }

      const data = await authService.completeRegister({
        token: verificationToken,
        full_name: fullName,
        username: username.trim(),
        password: password,
        confirmed_password: confirmPassword
      });

      const { access_token, refresh_token } = data.data;
      
      // Save tokens in tokenManager so subsequent calls can use it!
      setTokens(access_token, refresh_token);
      
      const profileData = await userService.getProfile();
      const profile = profileData.data;
      return {
        user: {
          email: profile.email || `${profile.username}@example.com`,
          name: profile.full_name || profile.username,
          username: profile.username,
          phone: profile.phone,
          role: profile.role
        },
        accessToken: access_token,
        refreshToken: refresh_token
      }
    },
    onSuccess: (data) => {
      toast.success("Đăng ký tài khoản thành công!")
      setSuccessMsg("Đăng ký tài khoản thành công! Đang đăng nhập...")
      login(data.user, data.accessToken, data.refreshToken)
      setTimeout(() => {
        router.push("/")
      }, 2000)
    },
    onError: (err: any) => {
      const msg = getVietnameseErrorMessage(err, "Không thể hoàn thành đăng ký.")
      toast.error(msg)
      setErrorMsg(msg)
    }
  })

  // Handlers
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")
    setIsPhoneRegistered(false)
    requestOtpMutation.mutate(phone)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")
    verifyOtpMutation.mutate({ phoneNum: phone, code: otpCode })
  }

  const handleCompleteRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")
    completeRegisterMutation.mutate()
  }

  const handleResendOtp = () => {
    setErrorMsg("")
    setSuccessMsg("")
    requestOtpMutation.mutate(phone)
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2522] font-sans antialiased flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-emerald-100 selection:text-emerald-950">
      
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
          Tạo tài khoản mới
        </h2>
        
        {/* Step Progress Indicator */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? "bg-[#1B4D3E] text-white" : "bg-[#EDE7D9] text-[#64716A]"
            }`}>
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
            </span>
            <span className={`text-xs font-bold ${step >= 1 ? "text-[#16422F]" : "text-[#8E9B94]"}`}>
              Nhận OTP
            </span>
          </div>
          <div className="h-px w-8 bg-[#EDE7D9]"></div>
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? "bg-[#1B4D3E] text-white" : "bg-[#EDE7D9] text-[#64716A]"
            }`}>
              {step > 2 ? <Check className="w-3.5 h-3.5" /> : "2"}
            </span>
            <span className={`text-xs font-bold ${step >= 2 ? "text-[#16422F]" : "text-[#8E9B94]"}`}>
              Xác thực OTP
            </span>
          </div>
          <div className="h-px w-8 bg-[#EDE7D9]"></div>
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? "bg-[#1B4D3E] text-white" : "bg-[#EDE7D9] text-[#64716A]"
            }`}>
              3
            </span>
            <span className={`text-xs font-bold ${step >= 3 ? "text-[#16422F]" : "text-[#8E9B94]"}`}>
              Hoàn tất
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-4 border border-[#EBE6DA] shadow-sm rounded-[2rem] sm:px-10">
          {isPhoneRegistered && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
              <p className="text-rose-800 text-2xs font-bold">Số điện thoại này đã được đăng ký tài khoản. Bạn đã có tài khoản?</p>
              <Link
                href="/login"
                className="mt-2 inline-flex justify-center items-center py-2 px-4 bg-[#1B4D3E] hover:bg-[#12362C] text-white font-bold rounded-xl text-2xs shadow-sm transition-all"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}

          {/* STEP 1: REQUEST OTP */}
          {step === 1 && (
            <form className="space-y-5" onSubmit={handleRequestOtp}>
              <div>
                <h3 className="text-base font-bold text-[#16422F] mb-1">Bước 1: Nhập số điện thoại</h3>
                <p className="text-2xs text-[#64716A] mb-4 font-semibold">Hệ thống sẽ gửi mã OTP gồm 6 chữ số để xác minh số điện thoại của bạn.</p>
                
                <label htmlFor="phone" className="block text-xs font-bold text-[#1E2522]">
                  Số điện thoại
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""))
                      setErrorMsg("")
                      setIsPhoneRegistered(false)
                    }}
                    className="block w-full pl-10 pr-4 py-3 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-sm font-medium transition-all"
                    placeholder="Ví dụ: 0987654321"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-[#1B4D3E] hover:bg-[#12362C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {requestOtpMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi yêu cầu OTP...
                    </>
                  ) : (
                    "Nhận mã OTP"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div>
                <h3 className="text-base font-bold text-[#16422F] mb-1">Bước 2: Nhập mã xác thực OTP</h3>
                <p className="text-2xs text-[#64716A] mb-4 font-semibold">
                  Mã OTP đã được gửi đến số điện thoại <strong className="text-[#1E2522]">{phone}</strong>. 
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="ml-1 text-emerald-700 font-extrabold hover:underline"
                  >
                    Thay đổi số
                  </button>
                </p>
                
                <label htmlFor="otp" className="block text-xs font-bold text-[#1E2522]">
                  Mã OTP (6 chữ số)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ""))
                      setErrorMsg("")
                      setIsPhoneRegistered(false)
                    }}
                    className="block w-full pl-10 pr-4 py-3 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-sm font-medium tracking-widest text-center font-mono transition-all"
                    placeholder="••••••"
                  />
                </div>
              </div>

              {/* Cooldown Resend Section */}
              <div className="flex items-center justify-between text-xs font-semibold">
                {cooldown > 0 ? (
                  <span className="text-[#8E9B94]">Gửi lại OTP sau {cooldown} giây</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={requestOtpMutation.isPending}
                    className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${requestOtpMutation.isPending ? "animate-spin" : ""}`} />
                    Gửi lại mã OTP
                  </button>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={verifyOtpMutation.isPending}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-[#1B4D3E] hover:bg-[#12362C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xác thực OTP...
                    </>
                  ) : (
                    "Xác nhận mã OTP"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: COMPLETE PROFILE */}
          {step === 3 && (
            <form className="space-y-4" onSubmit={handleCompleteRegister}>
              <div>
                <h3 className="text-base font-bold text-[#16422F] mb-1">Bước 3: Thiết lập tài khoản</h3>
                <p className="text-2xs text-[#64716A] mb-4 font-semibold">Hoàn tất đăng ký tài khoản với số điện thoại đã xác minh: {phone}</p>
                
                <label htmlFor="fullname" className="block text-xs font-bold text-[#1E2522]">
                  Họ và tên
                </label>
                <div className="mt-1 relative rounded-md shadow-sm mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs font-semibold transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <label htmlFor="username" className="block text-xs font-bold text-[#1E2522]">
                  Tên đăng nhập (Username)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs font-semibold transition-all"
                    placeholder="username123"
                  />
                </div>
                {usernameCheckLoading && (
                  <p className="text-2xs text-[#8E9B94] mb-3 flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang kiểm tra tên đăng nhập...
                  </p>
                )}
                {!usernameCheckLoading && isUsernameAvailable === true && (
                  <p className="text-2xs text-emerald-600 mb-3 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Tên đăng nhập khả dụng
                  </p>
                )}
                {!usernameCheckLoading && usernameError && (
                  <p className="text-2xs text-rose-600 mb-3 font-bold">
                    ⚠️ {usernameError}
                  </p>
                )}

                <label htmlFor="password" className="block text-xs font-bold text-[#1E2522]">
                  Mật khẩu
                </label>
                <div className="mt-1 relative rounded-md shadow-sm mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs font-semibold transition-all"
                    placeholder="Tối thiểu 8 ký tự"
                  />
                </div>

                <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#1E2522]">
                  Xác nhận mật khẩu
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E9B94]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 border border-[#C6C0B0] bg-[#FDFBF7] rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-xs font-semibold transition-all"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={completeRegisterMutation.isPending}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-[#1B4D3E] hover:bg-[#12362C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {completeRegisterMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang hoàn tất đăng ký...
                    </>
                  ) : (
                    "Đăng ký tài khoản"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footnotes */}
          <div className="mt-6 border-t border-[#F3EFE6] pt-6 text-center">
            <p className="text-2xs text-[#8E9B94] font-semibold">
              Bằng việc đăng ký, bạn đã đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Tươi.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
