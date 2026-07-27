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

export interface VerifyPhoneConfirmRequest {
  code: string;
}

export interface VerifyPhoneConfirmResponse {
  change_phone_token: string;
}

export interface ChangePhoneRequest {
  phone: string;
  change_phone_token: string;
}

export interface ChangePhoneConfirmRequest {
  phone: string;
  code: string;
}

export interface SendAccountOtpRequest {
  identifier: string;
  purpose: "change_email" | "verify_phone" | "change_phone";
  change_email_token?: string;
  change_phone_token?: string;
}

export interface VerifyAccountOtpRequest {
  identifier?: string;
  code: string;
  purpose: "change_email" | "verify_phone" | "change_phone";
  phone?: string;
}
