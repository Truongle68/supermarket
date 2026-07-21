export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
}

export interface CheckUsernameResponse {
  available: boolean;
}

export interface RequestOTPRequest {
  identifier: string;
  phone?: string;
}

export interface VerifyOTPRequest {
  identifier: string;
  phone?: string;
  otp_code: string;
}

export interface VerifyOTPResponse {
  verify_otp_token: string;
  user_exists: boolean;
  username?: string;
}

export interface CompleteRegisterRequest {
  token: string;
  full_name: string;
  username: string;
  password: string;
  confirmed_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  reset_token: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirmed_password: string;
}

export interface LogoutRequest {
  refresh_token: string;
}
