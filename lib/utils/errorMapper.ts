/**
 * Backend Error Message Mapping to Vietnamese
 * Maps raw backend error strings to user-friendly Vietnamese messages.
 */

export const BACKEND_ERROR_MAP: Record<string, string> = {
  // --- User & Auth Domain Errors ---
  "email is required": "Vui lòng nhập địa chỉ email.",
  "password must be at least 8 characters": "Mật khẩu phải chứa ít nhất 8 ký tự.",
  "confirmed password is not match": "Mật khẩu xác nhận không trùng khớp.",
  "email already registered": "Địa chỉ email này đã được đăng ký tài khoản.",
  "user not found": "Không tìm thấy thông tin người dùng.",
  "invalid credentials": "Tên đăng nhập hoặc mật khẩu không chính xác.",
  "user account is banned": "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.",
  "user account is inactive": "Tài khoản của bạn chưa được kích hoạt.",
  "invalid or expired token": "Mã token không hợp lệ hoặc đã hết hạn.",
  "invalid OTP code": "Mã OTP không chính xác.",
  "OTP code expired": "Mã OTP đã hết hạn.",
  "username cannot be empty": "Tên đăng nhập không được để trống.",
  "email cannot be empty": "Địa chỉ email không được để trống.",
  "phone cannot be empty": "Số điện thoại không được để trống.",
  "username already exists": "Tên đăng nhập này đã được sử dụng.",
  "phone number already registered": "Số điện thoại này đã được đăng ký tài khoản.",
  "address line cannot be empty": "Địa chỉ chi tiết không được để trống.",
  "userID cannot be empty": "Mã người dùng không được để trống.",
  "city cannot be empty": "Tỉnh/Thành phố không được để trống.",
  "new email must be different from current email": "Email mới phải khác với email hiện tại.",
  "new phone must be different from current phone": "Số điện thoại mới phải khác với số điện thoại hiện tại.",
  "no email address configured for this user": "Người dùng chưa thiết lập địa chỉ email.",
  "user role not authorized": "Tài khoản của bạn không có quyền thực hiện thao tác này.",
  "invalid full name": "Họ và tên không hợp lệ.",
  "invalid gender": "Giới tính không hợp lệ.",
  "invalid date of birth": "Ngày sinh không hợp lệ.",
  "at least 1 field is required to update": "Cần ít nhất 1 thông tin để thực hiện cập nhật.",
  "address not found": "Không tìm thấy thông tin địa chỉ.",
  "verified email cannot be updated directly": "Email đã xác thực không thể thay đổi trực tiếp.",
  "current email must be verified first": "Vui lòng xác thực email hiện tại trước khi thay đổi.",
  "current phone must be verified first": "Vui lòng xác thực số điện thoại hiện tại trước khi thay đổi.",
  "invalid operation or purpose": "Thao tác hoặc mục đích xử lý không hợp lệ.",
  "username must have at least 3 characters": "Tên đăng nhập phải có ít nhất 3 ký tự.",
  "token is required": "Vui lòng cung cấp mã token xác thực.",

  // --- Catalog & Product Domain Errors ---
  "product not found": "Không tìm thấy sản phẩm yêu cầu.",
  "category not found": "Không tìm thấy danh mục sản phẩm.",
  "product id cannot be empty": "Mã sản phẩm không được để trống.",
  "category id cannot be empty": "Mã danh mục không được để trống.",
  "name cannot be empty": "Tên sản phẩm/danh mục không được để trống.",
  "sku cannot be empty": "Mã SKU không được để trống.",
  "price cannot be negative": "Giá sản phẩm không được là số âm.",
  "invalid category id": "Mã danh mục không hợp lệ.",
  "invalid product id": "Mã sản phẩm không hợp lệ.",
  "no fields provided to update": "Không có thông tin nào được cung cấp để cập nhật.",
  "min_price cannot be greater than max_price": "Giá tối thiểu không được lớn hơn giá tối đa.",

  // --- Auth Middleware & Security Errors ---
  "unauthorized": "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.",
  "empty auth header": "Thiếu thông tin xác thực trong tiêu đề yêu cầu.",
  "invalid auth header format": "Định dạng thông tin xác thực không hợp lệ.",
  "token has been logged out": "Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.",
  "invalid request body": "Dữ liệu yêu cầu gửi lên không đúng định dạng.",
  "invalid query parameters": "Tham số tìm kiếm hoặc truy vấn không hợp lệ.",
  "forbidden: missing role": "Không có quyền truy cập: Thiếu thông tin vai trò.",
  "forbidden: invalid role format": "Không có quyền truy cập: Định dạng vai trò không hợp lệ.",
  "forbidden: insufficient permissions": "Tài khoản của bạn không có đủ quyền thực hiện thao tác này.",
  "internal server error": "Lỗi hệ thống máy chủ. Vui lòng thử lại sau.",
  "unexpected signing method": "Phương thức chữ ký token không hợp lệ.",
  "invalid token": "Mã token xác thực không hợp lệ.",

  // --- Network & Standard HTTP Errors ---
  "Network Error": "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.",
  "Request failed with status code 500": "Lỗi hệ thống từ máy chủ (500). Vui lòng thử lại sau.",
  "Request failed with status code 404": "Không tìm thấy tài nguyên yêu cầu (404).",
  "Request failed with status code 403": "Bạn không có quyền truy cập tài nguyên này (403).",
  "Request failed with status code 401": "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại (401).",
  "Request failed with status code 400": "Yêu cầu không hợp lệ (400).",
};

/**
 * Extracts and maps raw error message (from backend response or Error instance)
 * to a friendly Vietnamese message.
 *
 * @param error Any error object (AxiosError, Error, string, or backend response envelope)
 * @param fallbackMessage Optional default message if error string is empty or unknown
 * @returns Translated Vietnamese error string
 */
export function getVietnameseErrorMessage(error: any, fallbackMessage?: string): string {
  if (!error) {
    return fallbackMessage || "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";
  }

  // If error is directly a string
  if (typeof error === "string") {
    const trimmed = error.trim();
    if (BACKEND_ERROR_MAP[trimmed]) return BACKEND_ERROR_MAP[trimmed];

    // Case-insensitive lookup
    const lowerKey = trimmed.toLowerCase();
    for (const [key, val] of Object.entries(BACKEND_ERROR_MAP)) {
      if (key.toLowerCase() === lowerKey) return val;
    }
    return trimmed || fallbackMessage || "Đã xảy ra lỗi. Vui lòng thử lại.";
  }

  // Extract error message string from object
  const rawMsg =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;

  if (typeof rawMsg === "string" && rawMsg.trim()) {
    const trimmed = rawMsg.trim();

    // 1. Direct exact lookup
    if (BACKEND_ERROR_MAP[trimmed]) {
      return BACKEND_ERROR_MAP[trimmed];
    }

    // 2. Case-insensitive lookup
    const lowerMsg = trimmed.toLowerCase();
    for (const [key, val] of Object.entries(BACKEND_ERROR_MAP)) {
      if (key.toLowerCase() === lowerMsg) {
        return val;
      }
    }

    // 3. Partial phrase matching
    for (const [key, val] of Object.entries(BACKEND_ERROR_MAP)) {
      if (lowerMsg.includes(key.toLowerCase())) {
        return val;
      }
    }

    // Fallback to raw string if it's already customized
    return trimmed;
  }

  return fallbackMessage || "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";
}

export default getVietnameseErrorMessage;
