package com.store.service;

import com.store.entity.Customer;
import com.store.entity.Staff;
import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountValidationServiceTest {

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private AccountValidationService accountValidationService;

    @Test
    @DisplayName("BƯỚC 8.6: Email đã tồn tại trong bảng staff -> isEmailTaken trả về true")
    void isEmailTaken_whenExistsInStaff_returnsTrue() {
        when(staffRepository.findByEmailIgnoreCase("admin@store.com"))
                .thenReturn(Optional.of(Staff.builder().email("admin@store.com").build()));

        boolean taken = accountValidationService.isEmailTaken("admin@store.com");
        assertTrue(taken, "Email đã có ở staff phải được coi là taken");
    }

    @Test
    @DisplayName("BƯỚC 8.6: Email đã tồn tại trong bảng customers -> isEmailTaken trả về true")
    void isEmailTaken_whenExistsInCustomer_returnsTrue() {
        when(staffRepository.findByEmailIgnoreCase("customer@store.com"))
                .thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase("customer@store.com"))
                .thenReturn(Optional.of(Customer.builder().email("customer@store.com").build()));

        boolean taken = accountValidationService.isEmailTaken("customer@store.com");
        assertTrue(taken, "Email đã có ở customers phải được coi là taken");
    }

    @Test
    @DisplayName("BƯỚC 8.6: Email chưa tồn tại ở cả staff và customers -> isEmailTaken trả về false")
    void isEmailTaken_whenUnique_returnsFalse() {
        when(staffRepository.findByEmailIgnoreCase("unique@store.com"))
                .thenReturn(Optional.empty());
        when(customerRepository.findByEmailIgnoreCase("unique@store.com"))
                .thenReturn(Optional.empty());

        boolean taken = accountValidationService.isEmailTaken("unique@store.com");
        assertFalse(taken, "Email duy nhất phải trả về false");
    }
}
