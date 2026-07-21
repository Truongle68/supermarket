# Comprehensive Plan: Standardizing Endpoints to 4 Generic Verification Routes

This plan details the refactoring of all verification endpoints (registration OTP, email links, phone changes, email changes) across `user-service` to consistently adhere to the generic **4-endpoint design** introduced in `user-service/EMAIL_FLOWS.md`.

---

## 1. Goal & Architectural Principles

Currently, `user-service` has fragmented, single-purpose endpoints (`request-change-email`, `verify-change-email`, `request-change-phone`, `verify-change-phone`, `verify-email-token`, `complete-change-email`, `complete-change-phone`, etc.).

We will replace all these dedicated endpoints with **4 core generic routes**:

### The 4 Core Verification Routes

| Route | Scope | Method | Purpose |
|---|---|---|---|
| **`POST /account/email/link/request`** | Protected | Send email verification link | Purpose: `verify_new_email` or `verify_current_email` |
| **`GET /account/email/link/confirm`** | Public/Protected | Confirm email verification link token | Auto-attaches email (`verify_new_email`) OR issues `change_email_token` (`verify_current_email`) |
| **`POST /account/otp/send`** *(and `/auth/otp/send` for public)* | Public/Protected | Send generic OTP code via Email or SMS | Purpose: `register`, `change_email`, `change_phone`, `forgot_password` |
| **`POST /account/otp/verify`** *(and `/auth/otp/verify` for public)* | Public/Protected | Verify generic OTP code | Verifies OTP code and automatically executes & finalizes state change (e.g. update user email/phone) |

---

## 2. Updated Route Table Comparison

### Before vs After

| Legacy / Removed Endpoints | Replaced By Unified Route | Notes |
|---|---|---|
| `POST /auth/register/request-otp` | `POST /auth/otp/send` | `purpose: "register"` |
| `POST /auth/register/verify-otp` | `POST /auth/otp/verify` | `purpose: "register"` |
| `POST /users/request-change-email` | `POST /account/email/link/request` | `purpose: "verify_current_email"` |
| `POST /users/verify-change-email` | `GET /account/email/link/confirm` | Confirms link & returns `change_email_token` |
| `POST /users/complete-change-email` | `POST /account/otp/verify` | `purpose: "change_email"` + verifies OTP & finalizes email update |
| `POST /users/request-change-phone` | `POST /account/otp/send` | `purpose: "change_phone"` |
| `POST /users/verify-change-phone` | `POST /account/otp/verify` | `purpose: "change_phone"` + verifies OTP & updates phone |
| `POST /users/verify-email-token` | `GET /account/email/link/confirm` | `purpose: "verify_new_email"` |

---

## 3. End-to-End Operational Flows

### 1. Add Email Flow
1. `POST /account/email/link/request` (Body: `{ "email": "new@app.com", "purpose": "verify_new_email" }`) -> System dispatches email with link containing `token`.
2. User clicks link -> `GET /account/email/link/confirm?token=...` -> System validates token, sets email on user record, marks `is_email_verified = true`.

### 2. Change Email Flow (2-Phase)
1. `POST /account/email/link/request` (Body: `{ "purpose": "verify_current_email" }`) -> Dispatches link to CURRENT email.
2. User clicks link -> `GET /account/email/link/confirm?token=...` -> System validates token, returns JSON response `{ "change_email_token": "eyJhb..." }`.
3. `POST /account/otp/send` (Body: `{ "purpose": "change_email", "identifier": "new@app.com", "change_email_token": "eyJhb..." }`) -> System validates `change_email_token` belongs to actor, dispatches OTP code to new email.
4. `POST /account/otp/verify` (Body: `{ "purpose": "change_email", "identifier": "new@app.com", "code": "123456" }`) -> System validates OTP, updates user email in DB, marks `is_email_verified = true`.

### 3. Change Phone Flow
1. `POST /account/otp/send` (Body: `{ "purpose": "change_phone", "identifier": "+84987654321" }`) -> System dispatches OTP code to new phone.
2. `POST /account/otp/verify` (Body: `{ "purpose": "change_phone", "identifier": "+84987654321", "code": "123456" }`) -> System validates OTP and updates user phone in DB.

---

## 4. Proposed Code Changes

### [Component] Domain Layer

#### [MODIFY] [email_purpose.go](file:///d:/Go/go-micro/user-service/internal/domain/email_purpose.go)
Ensure link purposes are defined:
- `EmailLinkPurposeVerifyNew = "verify_new_email"`
- `EmailLinkPurposeVerifyCurrent = "verify_current_email"`

#### [MODIFY] [verify_purpose.go](file:///d:/Go/go-micro/user-service/internal/domain/verify_purpose.go)
Ensure generic OTP purposes cover:
- `VerifyPurposeRegister = "register"`
- `VerifyPurposeChangeEmail = "change_email"`
- `VerifyPurposeChangePhone = "change_phone"`

---

### [Component] Usecase Layer

#### [MODIFY] [contracts.go](file:///d:/Go/go-micro/user-service/internal/usecase/contracts.go)
Update `Auth` and `User` interface methods to support generic OTP & Email Link calls:
- `RequestEmailLink(ctx, in RequestEmailLinkInput) error`
- `ConfirmEmailLink(ctx, token string) (purpose, changeToken string, err error)`
- Extend `RequestOTP` / `VerifyOTP` to handle `change_email` and `change_phone` purposes.

#### [MODIFY] [auth_uc.go](file:///d:/Go/go-micro/user-service/internal/usecase/auth_uc.go) / [user_uc.go](file:///d:/Go/go-micro/user-service/internal/usecase/user_uc.go)
- Implement `RequestEmailLink` and `ConfirmEmailLink`.
- In `RequestOTP`: validate `change_email_token` when purpose is `change_email`.
- In `VerifyOTP`: update user record in DB when purpose is `change_email` or `change_phone`.

---

### [Component] Delivery Layer

#### [MODIFY] [router.go](file:///d:/Go/go-micro/user-service/internal/delivery/http/v1/router.go)
Clean up all redundant single-purpose routes and wire the 4 core routes under `/account` and `/auth`.

#### [MODIFY] [auth.go](file:///d:/Go/go-micro/user-service/internal/delivery/http/v1/auth.go) & [user.go](file:///d:/Go/go-micro/user-service/internal/delivery/http/v1/user.go)
Implement handlers:
- `requestEmailLink`
- `confirmEmailLink`
- `sendAccountOTP` / `verifyAccountOTP`
Remove deprecated handlers (`requestChangeEmail`, `verifyChangeEmail`, `completeChangeEmail`, `verifyEmailToken`, etc.).

---

### [Component] Testing & Integration

#### [MODIFY] [main.go](file:///d:/Go/go-micro/user-service/cmd/test_api/main.go)
Update test script to invoke the new 4-endpoint system.

---

## 5. Verification Plan

### Automated Tests
- Run `go test ./...` in `user-service`.
- Run `go run cmd/test_api/main.go` to verify end-to-end flow execution against running server.

### Manual Verification
- Test `add_email` link request & confirmation.
- Test `change_email` 2-phase execution:
  - Step 1: `POST /account/email/link/request` -> `GET /account/email/link/confirm` returns `change_email_token`.
  - Step 2: `POST /account/otp/send` with `change_email_token` -> `POST /account/otp/verify` updates email.
