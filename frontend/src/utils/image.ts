/**
 * Giữ nguyên URL gốc của Cloudinary, tránh thêm transformation tham số gây lỗi 404
 */
export const getCloudinaryTransformedUrl = (url?: string | null): string => {
  if (!url) return '/placeholder.png';
  return url;
};

