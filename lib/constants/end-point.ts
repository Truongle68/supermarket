export const ENDPOINT = {
  AUTH: {
    LOGIN: "/auth/login",
    PORTAL_LOGIN: "/auth/portal/login",
    REGISTER: "/auth/register",
    REGISTER_VERIFY: "/auth/register/verify",
    COMPLETE_REGISTER: "/auth/register/complete",
    CHECK_USERNAME: "/auth/check-username",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  USER: {
    GET_PROFILE: "/users/get-profile",
    UPDATE_PROFILE: "/users/update-profile",
    VERIFY_EMAIL: "/users/verify-email",
    VERIFY_EMAIL_CONFIRM: "/users/verify-email/confirm",
    CHANGE_EMAIL: "/users/change-email",
    CHANGE_EMAIL_CONFIRM: "/users/change-email/confirm",
    CHANGE_PHONE: "/users/change-phone",
    CHANGE_PHONE_VERIFY: "/users/change-phone/verify",
    ADDRESS: {
      GET_LIST: "/users/address/get-address-list",
      CREATE: "/users/address/create-address",
      SET_DEFAULT: "/users/address/set-default-address",
      UPDATE: "/users/address/update-address",
      DELETE: "/users/address/delete-address"
    }
  },
} as const;
