package com.store.chat.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PiiMaskerTest {

    @Test
    @DisplayName("Che giấu số điện thoại Việt Nam ở nhiều định dạng")
    void maskPii_vietnamPhoneNumbers() {
        // Định dạng 10 số thông thường
        assertThat(PiiMasker.maskPii("Số của tôi là 0912345678 nha"))
                .isEqualTo("Số của tôi là [SĐT] nha");

        // Đầu số +84
        assertThat(PiiMasker.maskPii("Gọi cho tôi qua +84987654321 nhé"))
                .isEqualTo("Gọi cho tôi qua [SĐT] nhé");

        // Đầu số 84 không dấu cộng
        assertThat(PiiMasker.maskPii("Hotline: 84903123456"))
                .isEqualTo("Hotline: [SĐT]");

        // Định dạng có dấu chấm hoặc khoảng trắng
        assertThat(PiiMasker.maskPii("SĐT: 0912.345.678 hoặc 0988 123 456"))
                .isEqualTo("SĐT: [SĐT] hoặc [SĐT]");

        // Định dạng có gạch ngang
        assertThat(PiiMasker.maskPii("Liên hệ 039-123-4567"))
                .isEqualTo("Liên hệ [SĐT]");
    }

    @Test
    @DisplayName("Che giấu địa chỉ email")
    void maskPii_emails() {
        assertThat(PiiMasker.maskPii("Email của tôi là user.test@gmail.com cảm ơn"))
                .isEqualTo("Email của tôi là [EMAIL] cảm ơn");

        assertThat(PiiMasker.maskPii("Gửi báo giá về contact@store.vn nhé"))
                .isEqualTo("Gửi báo giá về [EMAIL] nhé");
    }

    @Test
    @DisplayName("Che đồng thời cả SĐT và email trong cùng một đoạn văn bản")
    void maskPii_bothPhoneAndEmail() {
        String input = "Khách hàng Trần Văn A, SĐT: 0912345678, email: customer123@yahoo.com cần tư vấn iPhone 15.";
        String expected = "Khách hàng Trần Văn A, SĐT: [SĐT], email: [EMAIL] cần tư vấn iPhone 15.";
        assertThat(PiiMasker.maskPii(input)).isEqualTo(expected);
    }

    @Test
    @DisplayName("Không làm ảnh hưởng đến chuỗi văn bản không chứa PII hoặc số tiền/thông số kỹ thuật")
    void maskPii_noPii_remainsUntouched() {
        String text = "Tôi muốn tìm mua iPhone 15 Pro Max 256GB giá 29990000đ pin 4422mAh.";
        assertThat(PiiMasker.maskPii(text)).isEqualTo(text);

        assertThat(PiiMasker.maskPii("")).isEqualTo("");
        assertThat(PiiMasker.maskPii(null)).isNull();
    }
}
