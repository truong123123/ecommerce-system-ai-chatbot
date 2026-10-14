export type ChatRole = 'user' | 'assistant';

export interface ChatProductCard {
  id: number;
  slug: string;
  name: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  inStock: boolean;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  products?: ChatProductCard[];
  fallback?: boolean;
  createdAt: string;
}

export interface ChatApiHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatApiRequest {
  sessionId?: string | null;
  message: string;
  history?: ChatApiHistoryItem[];
}

export interface ChatApiResponse {
  sessionId: string;
  reply: string;
  products: ChatProductCard[];
  fallback: boolean;
}
