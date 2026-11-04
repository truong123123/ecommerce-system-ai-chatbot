package com.store.chat.util;

import java.util.regex.Pattern;

/**
 * Utility che giấu thông tin định danh cá nhân (PII) trước khi lưu vào cơ sở dữ liệu:
 * - Số điện thoại Việt Nam (0xxxxxxxxx, +84xxxxxxxxx, có hoặc không có dấu chấm/cách) -> [SĐT]
 * - Địa chỉ Email -> [EMAIL]
 */
public final class PiiMasker {

    private PiiMasker() {}

    // Regex email chuẩn RFC
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
    );

    // Regex số điện thoại Việt Nam (+84 hoặc 0, theo sau bởi 9 chữ số)
    // Hỗ trợ các định dạng phân cách như: 0912345678, 0912.345.678, 0912 345 678, +84 912 345 678
    private static final Pattern VN_PHONE_PATTERN = Pattern.compile(
            "(?<!\\w)(?:\\+84|84|0)(?:[\\s.-]?[35789])(?:[\\s.-]?\\d){8}\\b"
    );

    public static String maskPii(String text) {
        if (text == null || text.isBlank()) {
            return text;
        }

        // 1. Che email trước
        String masked = EMAIL_PATTERN.matcher(text).replaceAll("[EMAIL]");

        // 2. Che số điện thoại VN
        masked = VN_PHONE_PATTERN.matcher(masked).replaceAll("[SĐT]");

        return masked;
    }
}
