package com.store.service;

import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountValidationService {

    private final StaffRepository staffRepository;
    private final CustomerRepository customerRepository;

    /**
     * Kiểm tra chéo xem email đã tồn tại ở bảng staff hoặc customers hay chưa.
     */
    public boolean isEmailTaken(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        String cleanEmail = email.trim().toLowerCase();
        return staffRepository.findByEmailIgnoreCase(cleanEmail).isPresent()
                || customerRepository.findByEmailIgnoreCase(cleanEmail).isPresent();
    }
}
