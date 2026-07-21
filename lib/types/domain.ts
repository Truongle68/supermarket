export type UserRole = "admin" | "user" | "staff";

export type UserStatus = "verified" | "unverified" | "banned";

export type UserGender = "unknown" | "male" | "female" | "other";

export type AddressLabel = "home" | "work";

export type EmailLinkPurpose = "verify_new" | "verify_current";

export type VerifyPurpose = "register" | "change_email" | "change_phone";
