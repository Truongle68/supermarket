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
  UserProfile,
  UpdateProfileRequest,
  EmailLinkPurpose,
  ConfirmEmailLinkResponse,
  ChangeEmailRequest,
  ChangeEmailConfirmRequest,
  ChangeEmailConfirmResponse,
  ChangePhoneVerifyResponse,
  SendAccountOtpRequest,
  VerifyAccountOtpRequest,
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

  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const res = await httpClient.get(ENDPOINT.USER.GET_PROFILE);
    return res.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    const res = await httpClient.post(ENDPOINT.USER.UPDATE_PROFILE, data);
    return res.data;
  },

  requestEmailLink: async (
    email: string,
    purpose: EmailLinkPurpose = "verify_new"
  ): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.USER.VERIFY_EMAIL, { email, purpose });
    return res.data;
  },

  confirmEmailLink: async (token: string): Promise<ApiResponse<ConfirmEmailLinkResponse | null>> => {
    const res = await httpClient.get(`${ENDPOINT.USER.VERIFY_EMAIL_CONFIRM}?token=${encodeURIComponent(token)}`);
    return res.data;
  },

  changeEmail: async (data: ChangeEmailRequest): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.USER.CHANGE_EMAIL, {
      identifier: data.identifier,
      change_email_token: data.change_email_token,
    });
    return res.data;
  },

  changeEmailConfirm: async (data: ChangeEmailConfirmRequest): Promise<ApiResponse<ChangeEmailConfirmResponse | null>> => {
    const res = await httpClient.post(ENDPOINT.USER.CHANGE_EMAIL_CONFIRM, {
      identifier: data.identifier,
      code: data.code,
    });
    return res.data;
  },

  changePhone: async (phone: string): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.USER.CHANGE_PHONE, { phone });
    return res.data;
  },

  changePhoneVerify: async (phone: string, code: string): Promise<ApiResponse<ChangePhoneVerifyResponse | null>> => {
    const res = await httpClient.post(ENDPOINT.USER.CHANGE_PHONE_VERIFY, { phone, code });
    return res.data;
  },

  // Backward-compatible helpers for account OTP workflows
  sendAccountOtp: async (data: SendAccountOtpRequest): Promise<ApiResponse<null>> => {
    if (data.purpose === "change_email") {
      return authService.changeEmail({
        identifier: data.identifier,
        change_email_token: data.change_email_token || "",
      });
    }
    return authService.changePhone(data.identifier);
  },

  verifyAccountOtp: async (data: VerifyAccountOtpRequest): Promise<ApiResponse<ChangeEmailConfirmResponse | ChangePhoneVerifyResponse | null>> => {
    if (data.purpose === "change_email") {
      return authService.changeEmailConfirm({
        identifier: data.identifier,
        code: data.code,
      });
    }
    return authService.changePhoneVerify(data.identifier, data.code);
  },

  requestChangeEmail: async (email: string) => {
    return authService.requestEmailLink(email, "verify_current");
  },

  verifyEmailToken: async (token: string) => {
    return authService.confirmEmailLink(token);
  },
};

export default authService;
