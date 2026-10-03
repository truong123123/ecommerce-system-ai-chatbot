package com.store.controller;

import com.store.dto.flashsale.FlashSaleCampaignDto;
import com.store.entity.Customer;
import com.store.repository.CustomerRepository;
import com.store.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/flash-sales", "/flash-sale"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class FlashSaleController {

    private final FlashSaleService flashSaleService;
    private final CustomerRepository customerRepository;

    private Long resolveCurrentCustomerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return null;
        }
        return customerRepository.findByEmailIgnoreCase(auth.getName())
                .map(Customer::getCustomerId)
                .orElse(null);
    }

    /**
     * GET /api/v1/flash-sales/active hoặc /api/v1/flash-sale/current
     */
    @GetMapping({"/active", "/current"})
    public ResponseEntity<?> getActiveCampaign() {
        FlashSaleCampaignDto campaign = flashSaleService.getActiveCampaign();
        if (campaign == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(campaign);
    }

    /**
     * GET /api/v1/flash-sales
     */
    @GetMapping
    public ResponseEntity<List<FlashSaleCampaignDto>> getAllCampaigns() {
        return ResponseEntity.ok(flashSaleService.getAllCampaigns());
    }

    /**
     * GET /api/v1/flash-sales/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FlashSaleCampaignDto> getCampaignById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(flashSaleService.getCampaignById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/v1/flash-sales/items/{itemId}/check
     */
    @GetMapping("/items/{itemId}/check")
    public ResponseEntity<Map<String, Object>> checkEligibility(@PathVariable Long itemId) {
        Long customerId = resolveCurrentCustomerId();
        try {
            Map<String, Object> result = flashSaleService.checkPurchaseEligibility(itemId, customerId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/v1/flash-sale/slots hoặc /api/v1/flash-sales/slots
     */
    @GetMapping("/slots")
    public ResponseEntity<com.store.dto.flashsale.FlashSaleSlotsResponseDto> getSlots() {
        return ResponseEntity.ok(flashSaleService.getModernSlots());
    }

    /**
     * GET /api/v1/flash-sale/slots/{slotId}/products hoặc /api/v1/flash-sales/slots/{slotId}/products
     */
    @GetMapping("/slots/{slotId}/products")
    public ResponseEntity<List<com.store.dto.flashsale.FlashSaleProductDto>> getSlotProducts(@PathVariable Long slotId) {
        return ResponseEntity.ok(flashSaleService.getProductsBySlotId(slotId));
    }

    /**
     * POST /api/v1/flash-sale/checkout hoặc /api/v1/flash-sales/checkout
     */
    @PostMapping("/checkout")
    public ResponseEntity<com.store.dto.flashsale.FlashSaleCheckoutResponse> checkout(
            @RequestBody @jakarta.validation.Valid com.store.dto.flashsale.FlashSaleCheckoutRequest request) {
        com.store.dto.flashsale.FlashSaleCheckoutResponse response = flashSaleService.checkoutSlotProduct(request);
        if ("SUCCESS".equals(response.getCode())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
