export const CHAT_CONFIG = {
  assistantName: 'Trợ lý cửa hàng',
  welcomeMessage:
    'Xin chào! Tôi là Trợ lý AI của cửa hàng. Bạn cần tư vấn sản phẩm, so sánh cấu hình hay kiểm tra đơn hàng, chính sách nào?',
  quickSuggestions: [
    'Điện thoại dưới 20 triệu',
    'So sánh 2 laptop',
    'Chính sách bảo hành',
    'Tra cứu đơn hàng',
  ],
  maxMessageLength: 500,
  maxHistoryItems: 10,
  maxHistoryContentLength: 1000,
  sessionStorageKey: 'store_chat_session_v1',
  maxStoredMessages: 30,
} as const;
