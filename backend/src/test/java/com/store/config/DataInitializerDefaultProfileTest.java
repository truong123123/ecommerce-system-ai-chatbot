package com.store.config;

import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerDefaultProfileTest {

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private Environment environment;

    @Mock
    private com.store.service.AccountValidationService accountValidationService;

    @Test
    @DisplayName("BƯỚC 4: Profile mặc định (không phải dev, không có bootstrap env) KHÔNG tạo user")
    void defaultProfile_doesNotCreateUsers() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"default"});

        DataInitializer initializer = new DataInitializer(
                staffRepository,
                customerRepository,
                passwordEncoder,
                environment,
                accountValidationService
        );

        initializer.run();

        // Xác nhận không lưu bất kỳ entity staff hay customer nào
        verify(staffRepository, never()).save(any());
        verify(customerRepository, never()).save(any());
    }
}
