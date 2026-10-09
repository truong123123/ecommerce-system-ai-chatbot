import apiClient from './apiClient';

export interface ReviewReplyDto {
  replyId: number;
  reviewId: number;
  staffName: string;
  comment: string;
  createdAt: string;
}

export interface ReviewDto {
  reviewId: number;
  productId: number;
  productName?: string;
  customerId?: number;
  customerName: string;
  rating: number;
  comment: string;
  orderItemId?: number;
  isVerifiedPurchase: boolean;
  status: string;
  createdAt: string;
  reply?: ReviewReplyDto | null;
  helpfulCount?: number;
  isHelpful?: boolean;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: Record<string | number, number>;
}

export type ReviewEligibilityStatus =
  | 'NOT_LOGGED_IN'
  | 'STAFF_ACCOUNT'
  | 'NOT_PURCHASED'
  | 'ALREADY_REVIEWED'
  | 'ELIGIBLE';

export interface ReviewEligibilityDto {
  status: ReviewEligibilityStatus;
  message: string;
  review?: ReviewDto;
  eligibleOrderItemIds?: number[];
  canReview?: boolean;
  reason?: string;
  myReview?: ReviewDto;
  eligibleOrderItemId?: number;
}

export interface CreateReviewPayload {
  rating: number;
  comment: string;
  orderItemId: number;
}

export interface UpdateReviewPayload {
  rating: number;
  comment: string;
}

export interface PagedReviewsResponse {
  content: ReviewDto[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

export const reviewService = {
  // Lấy tổng quan sao & breakdown: GET /products/{productId}/reviews/summary
  async getReviewSummary(productId: number | string): Promise<ReviewSummary> {
    const res = await apiClient.get<ReviewSummary>(`/products/${productId}/reviews/summary`);
    return res.data;
  },

  // Lấy danh sách review có phân trang, lọc sao và sắp xếp: GET /products/{productId}/reviews
  async getReviewsPaged(
    productId: number | string,
    params: {
      rating?: number;
      page?: number;
      size?: number;
      sort?: 'newest' | 'highest' | 'lowest' | string;
    } = {}
  ): Promise<PagedReviewsResponse> {
    const res = await apiClient.get<PagedReviewsResponse>(`/products/${productId}/reviews`, {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 5,
        rating: params.rating,
        sort: params.sort ?? 'newest',
      },
    });
    return res.data;
  },

  // Danh sách review dạng mảng (hỗ trợ code cũ)
  async getProductReviews(productId: number | string): Promise<ReviewDto[]> {
    const res = await apiClient.get<ReviewDto[]>(`/reviews/product/${productId}`);
    return res.data;
  },

  // Kiểm tra điều kiện đánh giá của tài khoản: GET /products/{productId}/reviews/check-eligibility
  async checkEligibility(productId: number | string): Promise<ReviewEligibilityDto> {
    try {
      const res = await apiClient.get<ReviewEligibilityDto>(`/products/${productId}/reviews/check-eligibility`);
      return res.data;
    } catch {
      return {
        status: 'NOT_LOGGED_IN',
        message: 'Vui lòng đăng nhập để đánh giá.',
        canReview: false,
      };
    }
  },

  // Gửi đánh giá mới: POST /products/{productId}/reviews
  async createReview(productId: number | string, payload: CreateReviewPayload): Promise<ReviewDto> {
    const res = await apiClient.post<ReviewDto>(`/products/${productId}/reviews`, payload);
    return res.data;
  },

  // Chỉnh sửa đánh giá trong vòng 7 ngày: PUT /reviews/{reviewId}
  async updateReview(reviewId: number | string, payload: UpdateReviewPayload): Promise<ReviewDto> {
    const res = await apiClient.put<ReviewDto>(`/reviews/${reviewId}`, payload);
    return res.data;
  },

  // Xóa đánh giá trong vòng 7 ngày: DELETE /reviews/{reviewId}
  async deleteReview(reviewId: number | string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  // Bình chọn hữu ích: POST /reviews/{reviewId}/helpful
  async voteHelpful(reviewId: number | string): Promise<{ helpfulCount: number; isHelpful: boolean; message: string }> {
    const res = await apiClient.post<{ helpfulCount: number; isHelpful: boolean; message: string }>(`/reviews/${reviewId}/helpful`);
    return res.data;
  },

  // Admin APIs
  async getAllAdminReviews(): Promise<ReviewDto[]> {
    const res = await apiClient.get<ReviewDto[]>('/admin/reviews');
    return res.data;
  },

  async updateReviewStatus(reviewId: number, status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'HIDDEN' | string): Promise<ReviewDto> {
    const res = await apiClient.put<ReviewDto>(`/admin/reviews/${reviewId}/status`, { status });
    return res.data;
  },

  async deleteAdminReview(reviewId: number): Promise<void> {
    await apiClient.delete(`/admin/reviews/${reviewId}`);
  },

  async addReviewReply(reviewId: number, comment: string): Promise<ReviewDto> {
    const res = await apiClient.post<ReviewDto>(`/admin/reviews/${reviewId}/reply`, { comment });
    return res.data;
  },

  async deleteReviewReply(reviewId: number): Promise<void> {
    await apiClient.delete(`/admin/reviews/${reviewId}/reply`);
  },
};

export default reviewService;
