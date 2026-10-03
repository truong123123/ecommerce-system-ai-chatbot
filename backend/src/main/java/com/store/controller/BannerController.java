package com.store.controller;

import com.store.entity.Banner;
import com.store.repository.BannerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/banners")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BannerController {

    private final BannerRepository bannerRepository;

    public BannerController(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    @GetMapping
    public ResponseEntity<List<Banner>> getActiveBanners() {
        List<Banner> banners = bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        return ResponseEntity.ok(banners);
    }

    @PostMapping
    public ResponseEntity<Banner> createBanner(@RequestBody Banner banner) {
        Banner saved = bannerRepository.save(banner);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banner> updateBanner(@PathVariable Long id, @RequestBody Banner bannerDetails) {
        return bannerRepository.findById(id).map(existing -> {
            if (bannerDetails.getTitle() != null) existing.setTitle(bannerDetails.getTitle());
            if (bannerDetails.getHeadline() != null) existing.setHeadline(bannerDetails.getHeadline());
            if (bannerDetails.getSubHeadline() != null) existing.setSubHeadline(bannerDetails.getSubHeadline());
            if (bannerDetails.getImageUrl() != null) existing.setImageUrl(bannerDetails.getImageUrl());
            if (bannerDetails.getPrimaryBtnText() != null) existing.setPrimaryBtnText(bannerDetails.getPrimaryBtnText());
            if (bannerDetails.getPrimaryBtnLink() != null) existing.setPrimaryBtnLink(bannerDetails.getPrimaryBtnLink());
            if (bannerDetails.getSecondaryBtnText() != null) existing.setSecondaryBtnText(bannerDetails.getSecondaryBtnText());
            if (bannerDetails.getSecondaryBtnLink() != null) existing.setSecondaryBtnLink(bannerDetails.getSecondaryBtnLink());
            if (bannerDetails.getBgColor() != null) existing.setBgColor(bannerDetails.getBgColor());
            if (bannerDetails.getTextColor() != null) existing.setTextColor(bannerDetails.getTextColor());
            if (bannerDetails.getDisplayOrder() != null) existing.setDisplayOrder(bannerDetails.getDisplayOrder());
            if (bannerDetails.getIsActive() != null) existing.setIsActive(bannerDetails.getIsActive());
            return ResponseEntity.ok(bannerRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        if (bannerRepository.existsById(id)) {
            bannerRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
