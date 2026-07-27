import httpClient from "@/lib/httpClient";
import { ENDPOINT } from "@/lib/constants/end-point";
import {
  ApiResponse,
  LoginRequest,
  AuthResponse,
  CheckUsernameResponse,
  VerifyOTPResponse,
  CompleteRegisterRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
} from "@/lib/types";

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await httpClient.post(ENDPOINT.AUTH.LOGIN, data);
    return res.data;
  },

  portalLogin: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await httpClient.post(ENDPOINT.AUTH.PORTAL_LOGIN, data);
    return res.data;
  },

  checkUsername: async (username: string): Promise<ApiResponse<CheckUsernameResponse>> => {
    const res = await httpClient.get(`${ENDPOINT.AUTH.CHECK_USERNAME}?username=${encodeURIComponent(username)}`);
    return res.data;
  },

  requestOtp: async (phone: string): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.AUTH.REGISTER, {
      identifier: phone,
      phone,
    });
    return res.data;
  },

  verifyOtp: async (phone: string, otp_code: string): Promise<ApiResponse<VerifyOTPResponse>> => {
    const res = await httpClient.post(ENDPOINT.AUTH.REGISTER_VERIFY, {
      identifier: phone,
      phone,
      otp_code,
    });
    return res.data;
  },

  completeRegister: async (data: CompleteRegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await httpClient.post(ENDPOINT.AUTH.COMPLETE_REGISTER, data);
    return res.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<ForgotPasswordResponse>> => {
    const res = await httpClient.post(ENDPOINT.AUTH.FORGOT_PASSWORD, { email });
    return res.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.AUTH.RESET_PASSWORD, data);
    return res.data;
  },

  logout: async (refreshToken: string): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.AUTH.LOGOUT, { refresh_token: refreshToken });
    return res.data;
  },
};

export default authService;
