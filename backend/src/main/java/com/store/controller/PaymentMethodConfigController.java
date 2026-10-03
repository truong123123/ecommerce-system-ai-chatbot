package com.store.controller;

import com.store.dto.checkout.PaymentMethodDto;
import com.store.entity.PaymentMethodConfig;
import com.store.repository.PaymentMethodConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payment-methods")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentMethodConfigController {

    private final PaymentMethodConfigRepository paymentMethodConfigRepository;

    @GetMapping
    public ResponseEntity<List<PaymentMethodDto>> getActivePaymentMethods() {
        List<PaymentMethodConfig> configs = paymentMethodConfigRepository.findByIsActiveTrueOrderBySortOrderAsc();
        List<PaymentMethodDto> dtos = configs.stream()
                .map(c -> PaymentMethodDto.builder()
                        .code(c.getCode())
                        .name(c.getName())
                        .icon(c.getIcon())
                        .description(c.getDescription())
                        .active(c.getIsActive())
                        .sortOrder(c.getSortOrder())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
