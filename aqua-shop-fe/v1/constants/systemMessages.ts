export const SYSTEM_MESSAGES = {
  API_CONNECTION_ERROR:
    "Không kết nối được backend. Hãy chạy server Java tại http://127.0.0.1:8080 rồi thử lại.",
  UNAUTHORIZED: "Email hoặc mật khẩu không đúng.",
  NOT_FOUND: "Không tìm thấy API endpoint. Kiểm tra lại đường dẫn backend.",
  GENERIC_ERROR: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
  ADMIN_FORBIDDEN: "Bạn không có quyền truy cập trang quản trị.",
  SAVE_SUCCESS: "Lưu thành công.",
  DELETE_SUCCESS: "Đã xóa thành công.",
  DEACTIVATE_SUCCESS: "Đã ngừng bán sản phẩm.",
  CART_ADD_SUCCESS: "Đã thêm vào giỏ hàng.",
  CART_ADD_UNAVAILABLE: "Không thể thêm sản phẩm này vào giỏ.",
  CART_CHECKOUT_SUCCESS:
    "Đã tạo giỏ hàng trên hệ thống. Bạn có thể tiếp tục thanh toán.",
  CART_CHECKOUT_EMPTY: "Giỏ hàng trống.",
  CART_ITEM_REMOVED: "Đã xóa sản phẩm khỏi giỏ.",
} as const;
