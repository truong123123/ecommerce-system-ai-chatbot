package com.store.controller;

import com.store.entity.SystemSetting;
import com.store.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final SystemSettingRepository systemSettingRepository;

    private static final Map<String, String[]> DEFAULT_SETTINGS = new LinkedHashMap<>();
    static {
        DEFAULT_SETTINGS.put("store_name", new String[]{"TruongStore - Điện thoại & Phụ kiện chính hãng", "Tên nhận diện cửa hàng"});
        DEFAULT_SETTINGS.put("hotline", new String[]{"1800 2097", "Hotline tổng đài tư vấn miễn phí"});
        DEFAULT_SETTINGS.put("contact_email", new String[]{"cskh@truongstore.com", "Email tiếp nhận liên hệ CSKH"});
        DEFAULT_SETTINGS.put("headquarters_address", new String[]{"134 Nguyễn Thái Học, P. Phạm Ngũ Lão, Quận 1, TP. HCM", "Địa chỉ trụ sở chính"});
        DEFAULT_SETTINGS.put("free_shipping_threshold", new String[]{"500000", "Ngưỡng giá trị đơn hàng miễn phí ship (VNĐ)"});
        DEFAULT_SETTINGS.put("standard_shipping_fee", new String[]{"30000", "Phí giao hàng tiêu chuẩn (VNĐ)"});
        DEFAULT_SETTINGS.put("order_hold_minutes", new String[]{"15", "Thời gian giữ chỗ hàng chờ thanh toán VNPay/Momo (phút)"});
        DEFAULT_SETTINGS.put("system_maintenance", new String[]{"false", "Trạng thái bảo trì hệ thống (true/false)"});
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings() {
        List<SystemSetting> existing = systemSettingRepository.findAll();
        Map<String, String> settingsMap = new HashMap<>();

        for (SystemSetting s : existing) {
            settingsMap.put(s.getSettingKey(), s.getValue());
        }

        // Tự động bổ sung các thiết lập mặc định nếu chưa có
        for (Map.Entry<String, String[]> entry : DEFAULT_SETTINGS.entrySet()) {
            if (!settingsMap.containsKey(entry.getKey())) {
                SystemSetting newSetting = SystemSetting.builder()
                        .settingKey(entry.getKey())
                        .value(entry.getValue()[0])
                        .description(entry.getValue()[1])
                        .updatedAt(OffsetDateTime.now())
                        .build();
                systemSettingRepository.save(newSetting);
                settingsMap.put(entry.getKey(), entry.getValue()[0]);
            }
        }

        return ResponseEntity.ok(Map.of(
                "settings", settingsMap,
                "updatedAt", OffsetDateTime.now()
        ));
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> newSettings) {
        if (newSettings == null || newSettings.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Dữ liệu cấu hình không được để trống"));
        }

        for (Map.Entry<String, String> entry : newSettings.entrySet()) {
            String key = entry.getKey();
            String val = entry.getValue() != null ? entry.getValue().trim() : "";

            Optional<SystemSetting> opt = systemSettingRepository.findBySettingKey(key);
            SystemSetting setting;
            if (opt.isPresent()) {
                setting = opt.get();
                setting.setValue(val);
                setting.setUpdatedAt(OffsetDateTime.now());
            } else {
                String desc = DEFAULT_SETTINGS.containsKey(key) ? DEFAULT_SETTINGS.get(key)[1] : "Cấu hình hệ thống " + key;
                setting = SystemSetting.builder()
                        .settingKey(key)
                        .value(val)
                        .description(desc)
                        .updatedAt(OffsetDateTime.now())
                        .build();
            }
            systemSettingRepository.save(setting);
        }

        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật cấu hình hệ thống thành công!",
                "settings", newSettings
        ));
    }
}

