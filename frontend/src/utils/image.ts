/**
 * Chuyển đổi URL Cloudinary sang dạng tối ưu hình ảnh sản phẩm:
 * Thêm /upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/
 */
export const getCloudinaryTransformedUrl = (url?: string | null): string => {
  if (!url) return '/placeholder.png';
  if (url.includes('/upload/') && !url.includes('/w_')) {
    return url.replace('/upload/', '/upload/w_800,h_800,c_pad,b_white,q_auto,f_auto/');
  }
  return url;
};

