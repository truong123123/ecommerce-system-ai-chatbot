package com.store.payment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class VNPayServiceTest {

    private VNPayService vnPayService;
    private final String testSecret = "A1B2C3D4E5F67890123456789012345678901234567890123456789012345678";

    @BeforeEach
    void setUp() {
        vnPayService = new VNPayService();
        ReflectionTestUtils.setField(vnPayService, "vnpTmnCode", "TESTTMN");
        ReflectionTestUtils.setField(vnPayService, "vnpHashSecret", testSecret);
        ReflectionTestUtils.setField(vnPayService, "vnpUrl", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
    }

    @Test
    @DisplayName("BƯỚC 5: Chữ ký giả mạo bị từ chối bởi verifySignature")
    void shouldRejectFakeSignature() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "10000000");
        params.put("vnp_TxnRef", "ORD-123456");

        boolean result = vnPayService.verifySignature(params, "fake_hash_12345");
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("BƯỚC 5: Secret DEMOHASHSECRET KHÔNG CÒN bypass được khi chữ ký sai")
    void shouldNotBypassWhenSecretIsDemoHashSecret() {
        ReflectionTestUtils.setField(vnPayService, "vnpHashSecret", "DEMOHASHSECRET");

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "10000000");
        params.put("vnp_TxnRef", "ORD-123456");

        boolean result = vnPayService.verifySignature(params, "fake_hash_attempt");
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("BƯỚC 5: Chữ ký HMAC-SHA512 chuẩn xác được chấp nhận thành công")
    void shouldAcceptValidSignature() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "10000000");
        params.put("vnp_TxnRef", "ORD-123456");

        // Sinh hash chuẩn bằng chính secret
        String hashData = "vnp_Amount=10000000&vnp_TxnRef=ORD-123456";
        String validHash = vnPayService.hmacSHA512(testSecret, hashData);

        boolean result = vnPayService.verifySignature(params, validHash);
        assertThat(result).isTrue();
    }
}
