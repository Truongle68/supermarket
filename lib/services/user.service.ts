import { ENDPOINT } from "../constants/end-point";
import httpClient from "../httpClient";
import {
  ApiResponse,
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  UserProfile,
  UpdateProfileRequest,
  EmailLinkPurpose,
  ConfirmEmailLinkResponse,
  ChangeEmailRequest,
  ChangeEmailConfirmRequest,
  VerifyPhoneConfirmResponse,
  ChangePhoneConfirmRequest,
  SendAccountOtpRequest,
  VerifyAccountOtpRequest,
} from "@/lib/types";

export const userService = {
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const res = await httpClient.get(ENDPOINT.USER.PROFILE);
    return res.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    const res = await httpClient.put(ENDPOINT.USER.PROFILE, data);
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

  changeEmailConfirm: async (data: ChangeEmailConfirmRequest): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.USER.CHANGE_EMAIL_CONFIRM, {
      identifier: data.identifier,
      code: data.code,
    });
    return res.data;
  },

  verifyPhone: async (): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.USER.VERIFY_PHONE);
    return res.data;
  },

  verifyPhoneConfirm: async (code: string): Promise<ApiResponse<VerifyPhoneConfirmResponse | null>> => {
    const res = await httpClient.post(ENDPOINT.USER.VERIFY_PHONE_CONFIRM, { code });
    return res.data;
  },

  changePhone: async (phone: string, change_phone_token: string): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.USER.CHANGE_PHONE, {
      phone,
      change_phone_token,
    });
    return res.data;
  },

  changePhoneConfirm: async (data: ChangePhoneConfirmRequest): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.USER.CHANGE_PHONE_CONFIRM, {
      phone: data.phone,
      code: data.code,
    });
    return res.data;
  },

  // Backward-compatible helpers for account OTP workflows
  sendAccountOtp: async (data: SendAccountOtpRequest): Promise<ApiResponse<null>> => {
    if (data.purpose === "change_email") {
      return userService.changeEmail({
        identifier: data.identifier,
        change_email_token: data.change_email_token || "",
      });
    }
    if (data.purpose === "verify_phone") {
      return userService.verifyPhone();
    }
    return userService.changePhone(data.identifier, data.change_phone_token || "");
  },

  verifyAccountOtp: async (
    data: VerifyAccountOtpRequest
  ): Promise<ApiResponse<VerifyPhoneConfirmResponse | null>> => {
    if (data.purpose === "change_email") {
      return userService.changeEmailConfirm({
        identifier: data.identifier || "",
        code: data.code,
      });
    }
    if (data.purpose === "verify_phone") {
      return userService.verifyPhoneConfirm(data.code);
    }
    return userService.changePhoneConfirm({
      phone: data.phone || data.identifier || "",
      code: data.code,
    });
  },

  requestChangeEmail: async (email: string) => {
    return userService.requestEmailLink(email, "verify_current");
  },

  verifyEmailToken: async (token: string) => {
    return userService.confirmEmailLink(token);
  },
  // Address Services
  getAddressList: async (): Promise<ApiResponse<Address[]>> => {
    const res = await httpClient.get(ENDPOINT.USER.ADDRESSES);
    return res.data;
  },

  createAddress: async (data: CreateAddressRequest): Promise<ApiResponse<Address>> => {
    const res = await httpClient.post(ENDPOINT.USER.ADDRESSES, data);
    return res.data;
  },

  setDefaultAddress: async (id: string): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.USER.ADDRESS_SET_DEFAULT(id));
    return res.data;
  },

  updateAddress: async (id: string, data: UpdateAddressRequest): Promise<ApiResponse<Address>> => {
    const res = await httpClient.put(ENDPOINT.USER.ADDRESS_UPDATE(id), data);
    return res.data;
  },

  deleteAddress: async (id: string): Promise<ApiResponse<null>> => {
    const res = await httpClient.delete(ENDPOINT.USER.ADDRESS_DELETE(id));
    return res.data;
  },
};

export default userService;