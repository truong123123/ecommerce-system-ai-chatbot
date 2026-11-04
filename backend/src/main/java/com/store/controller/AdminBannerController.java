package com.store.controller;

import com.store.entity.Banner;
import com.store.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {

    private final BannerRepository bannerRepository;

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerRepository.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping
    public ResponseEntity<?> createBanner(@RequestBody Banner banner) {
        if (banner.getTitle() == null || banner.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tiêu đề banner không được để trống"));
        }
        if (banner.getImageUrl() == null || banner.getImageUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hình ảnh banner không được để trống"));
        }

        Banner saved = bannerRepository.save(banner);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBanner(@PathVariable Long id, @RequestBody Banner bannerDetails) {
        Optional<Banner> bannerOpt = bannerRepository.findById(id);
        if (bannerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy banner với ID: " + id));
        }

        Banner existing = bannerOpt.get();
        if (bannerDetails.getTitle() != null) existing.setTitle(bannerDetails.getTitle().trim());
        if (bannerDetails.getHeadline() != null) existing.setHeadline(bannerDetails.getHeadline().trim());
        if (bannerDetails.getSubHeadline() != null) existing.setSubHeadline(bannerDetails.getSubHeadline().trim());
        if (bannerDetails.getImageUrl() != null) existing.setImageUrl(bannerDetails.getImageUrl().trim());
        if (bannerDetails.getPrimaryBtnText() != null) existing.setPrimaryBtnText(bannerDetails.getPrimaryBtnText().trim());
        if (bannerDetails.getPrimaryBtnLink() != null) existing.setPrimaryBtnLink(bannerDetails.getPrimaryBtnLink().trim());
        if (bannerDetails.getSecondaryBtnText() != null) existing.setSecondaryBtnText(bannerDetails.getSecondaryBtnText().trim());
        if (bannerDetails.getSecondaryBtnLink() != null) existing.setSecondaryBtnLink(bannerDetails.getSecondaryBtnLink().trim());
        if (bannerDetails.getBgColor() != null) existing.setBgColor(bannerDetails.getBgColor().trim());
        if (bannerDetails.getTextColor() != null) existing.setTextColor(bannerDetails.getTextColor().trim());
        if (bannerDetails.getDisplayOrder() != null) existing.setDisplayOrder(bannerDetails.getDisplayOrder());
        if (bannerDetails.getIsActive() != null) existing.setIsActive(bannerDetails.getIsActive());

        Banner updated = bannerRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        if (!bannerRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy banner với ID: " + id));
        }
        bannerRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Xóa banner thành công!"));
    }
}

