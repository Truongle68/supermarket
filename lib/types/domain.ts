export type UserRole = "user" | "admin" | "staff";

export type UserStatus = "verified" | "unverified" | "banned";

export type UserGender = "unknown" | "male" | "female" | "other";

export type AddressLabel = "home" | "work";

export type VerifyPurpose = "register" | "change_email" | "verify_phone" | "change_phone";

export type EmailLinkPurpose = "verify_new" | "verify_current";

export type CredentialType = "phone" | "email" | "google";

export type OTPChannel = "sms" | "email";
