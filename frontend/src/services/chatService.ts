import axios from 'axios';
import { apiClient } from './api';
import {
  ChatApiHistoryItem,
  ChatApiRequest,
  ChatApiResponse,
  ChatMessage,
} from '../types/chat';
import { CHAT_CONFIG } from '../config/chat';

export interface SendChatMessageParams {
  sessionId?: string | null;
  message: string;
  history?: Array<Pick<ChatMessage, 'role' | 'content'>>;
}

/**
 * Lọc và chuẩn hóa lịch sử hội thoại trước khi gửi sang backend:
 * - Chỉ lấy tối đa 10 lượt gần nhất
 * - Chỉ chấp nhận role 'user' và 'assistant'
 * - Cắt mỗi nội dung tối đa 1000 ký tự
 */
export function sanitizeHistory(
  history?: Array<{ role: string; content?: string | null }>
): ChatApiHistoryItem[] {
  if (!Array.isArray(history) || history.length === 0) {
    return [];
  }

  const validRoles = new Set(['user', 'assistant']);
  const sanitized: ChatApiHistoryItem[] = [];

  for (const item of history) {
    if (!item || !validRoles.has(item.role)) {
      continue;
    }
    const rawContent = typeof item.content === 'string' ? item.content : '';
    const trimmed = rawContent.trim();
    if (!trimmed) {
      continue;
    }
    const truncated =
      trimmed.length > CHAT_CONFIG.maxHistoryContentLength
        ? trimmed.substring(0, CHAT_CONFIG.maxHistoryContentLength)
        : trimmed;

    sanitized.push({
      role: item.role as 'user' | 'assistant',
      content: truncated,
    });
  }

  // Giữ tối đa 10 lượt gần nhất
  return sanitized.slice(-CHAT_CONFIG.maxHistoryItems);
}

/**
 * Gửi tin nhắn tới backend POST /chat.
 * Xử lý:
 * - 403: Thử lấy CSRF token qua GET /banners rồi retry đúng 1 lần.
 * - 429: Trả về thông báo thân thiện "Bạn gửi quá nhanh, vui lòng thử lại sau ít phút."
 * - Lỗi mạng / 5xx: Trả về thông báo thân thiện thay vì ném lỗi ra ngoài làm sập UI.
 */
export async function sendChatMessage(
  params: SendChatMessageParams
): Promise<ChatApiResponse> {
  const rawMessage = (params.message || '').trim();
  const truncatedMessage =
    rawMessage.length > CHAT_CONFIG.maxMessageLength
      ? rawMessage.substring(0, CHAT_CONFIG.maxMessageLength)
      : rawMessage;

  const payload: ChatApiRequest = {
    sessionId: params.sessionId || null,
    message: truncatedMessage,
    history: sanitizeHistory(params.history),
  };

  try {
    const response = await apiClient.post<ChatApiResponse>('/chat', payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;

      // Xử lý 403 (thiếu hoặc lệch XSRF-TOKEN cookie ở lần đầu của khách) -> Thử refresh cookie và retry 1 lần
      if (status === 403) {
        try {
          await apiClient.get('/banners');
          const retryResponse = await apiClient.post<ChatApiResponse>(
            '/chat',
            payload
          );
          return retryResponse.data;
        } catch (retryError: unknown) {
          if (
            axios.isAxiosError(retryError) &&
            retryError.response?.status === 429
          ) {
            return {
              sessionId: params.sessionId || '',
              reply: 'Bạn gửi quá nhanh, vui lòng thử lại sau ít phút.',
              products: [],
              fallback: true,
            };
          }
          return {
            sessionId: params.sessionId || '',
            reply:
              'Xin lỗi, yêu cầu bảo mật của phiên làm việc chưa hoàn tất. Vui lòng tải lại trang và thử lại.',
            products: [],
            fallback: true,
          };
        }
      }

      // Xử lý 429: Rate limit exceeded
      if (status === 429) {
        return {
          sessionId: params.sessionId || '',
          reply: 'Bạn gửi quá nhanh, vui lòng thử lại sau ít phút.',
          products: [],
          fallback: true,
        };
      }

      // Các mã lỗi 4xx/5xx khác từ backend
      return {
        sessionId: params.sessionId || '',
        reply:
          'Xin lỗi, hiện tại trợ lý AI đang gặp sự cố kỹ thuật. Vui lòng thử lại sau ít phút hoặc liên hệ hotline cửa hàng.',
        products: [],
        fallback: true,
      };
    }

    // Lỗi mạng hoặc ngắt kết nối (Network Error)
    return {
      sessionId: params.sessionId || '',
      reply:
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng của bạn.',
      products: [],
      fallback: true,
    };
  }
}

export const chatService = {
  sendChatMessage,
  sanitizeHistory,
};
