import { UserGender, UserRole, UserStatus, EmailLinkPurpose } from "./domain";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  is_email_verified: boolean;
  phone: string;
  full_name: string;
  gender: UserGender;
  dob: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  email?: string;
  full_name?: string;
  gender?: UserGender;
  dob?: string;
}

export interface RequestEmailLinkRequest {
  email: string;
  purpose?: EmailLinkPurpose;
}

export interface ConfirmEmailLinkResponse {
  change_email_token?: string;
}

export interface ChangeEmailRequest {
  identifier: string;
  change_email_token: string;
}

export interface ChangeEmailConfirmRequest {
  identifier: string;
  code: string;
}

export interface ChangeEmailConfirmResponse {
  token?: string;
}

export interface ChangePhoneRequest {
  phone: string;
}

export interface ChangePhoneVerifyRequest {
  phone: string;
  code: string;
}

export interface ChangePhoneVerifyResponse {
  token?: string;
}

export interface SendAccountOtpRequest {
  identifier: string;
  purpose: "change_email" | "change_phone";
  change_email_token?: string;
}

export interface VerifyAccountOtpRequest {
  identifier: string;
  code: string;
  purpose: "change_email" | "change_phone";
}
