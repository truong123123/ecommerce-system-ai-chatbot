package com.store.config;

import com.store.entity.Customer;
import com.store.entity.Staff;
import com.store.entity.StaffRole;
import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import com.store.service.AccountValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final StaffRepository staffRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;
    private final AccountValidationService accountValidationService;

    @Override
    public void run(String... args) {
        boolean isDev = environment != null && Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("dev") || p.equalsIgnoreCase("development"));

        if (isDev) {
            // Chỉ chạy ở profile dev
            if (staffRepository.count() == 0) {
                log.info("Profile dev: Khởi tạo tài khoản staff dev...");
                String devAdminPass = System.getenv("DEV_ADMIN_PASSWORD");
                if (devAdminPass == null || devAdminPass.isBlank()) {
                    devAdminPass = "DevAdmin@" + UUID.randomUUID().toString().substring(0, 8) + "!2026";
                    log.info("Profile dev: Đã sinh ngẫu nhiên mật khẩu khởi tạo cho admin: {}", devAdminPass);
                }

                Staff admin = Staff.builder()
                        .fullName("Nguyễn Văn Admin")
                        .email("admin@store.com")
                        .role(StaffRole.admin)
                        .passwordHash(passwordEncoder.encode(devAdminPass))
                        .phone("0988888888")
                        .isActive(true)
                        .hiredAt(LocalDate.now())
                        .lastLoginAt(OffsetDateTime.now())
                        .build();
                staffRepository.save(admin);

                String devSalesPass = System.getenv("DEV_SALES_PASSWORD");
                if (devSalesPass == null || devSalesPass.isBlank()) {
                    devSalesPass = "DevSales@" + UUID.randomUUID().toString().substring(0, 8) + "!2026";
                    log.info("Profile dev: Đã sinh ngẫu nhiên mật khẩu khởi tạo cho sales: {}", devSalesPass);
                }

                Staff sales = Staff.builder()
                        .fullName("Trần Thị Sales")
                        .email("sales@store.com")
                        .role(StaffRole.sales)
                        .passwordHash(passwordEncoder.encode(devSalesPass))
                        .phone("0977777777")
                        .isActive(true)
                        .hiredAt(LocalDate.now())
                        .build();
                staffRepository.save(sales);

                log.info("Profile dev: Đã tạo tài khoản staff dev: admin@store.com và sales@store.com");
            }

            if (customerRepository.count() == 0) {
                log.info("Profile dev: Khởi tạo tài khoản khách hàng dev...");
                String devCustPass = System.getenv("DEV_CUSTOMER_PASSWORD");
                if (devCustPass == null || devCustPass.isBlank()) {
                    devCustPass = "DevCust@" + UUID.randomUUID().toString().substring(0, 8) + "!2026";
                    log.info("Profile dev: Đã sinh ngẫu nhiên mật khẩu khởi tạo cho customer: {}", devCustPass);
                }

                Customer customer = Customer.builder()
                        .fullName("Nguyễn Khách Hàng")
                        .email("customer@store.com")
                        .passwordHash(passwordEncoder.encode(devCustPass))
                        .phone("0901234567")
                        .gender("M")
                        .birthDate(LocalDate.of(1998, 5, 20))
                        .loyaltyPoints(100)
                        .isActive(true)
                        .createdAt(OffsetDateTime.now())
                        .updatedAt(OffsetDateTime.now())
                        .build();
                customerRepository.save(customer);

                log.info("Profile dev: Đã tạo tài khoản khách hàng dev: customer@store.com");
            }
            return;
        }

        // Ngoài dev: Chỉ tạo admin khi có BOOTSTRAP_ADMIN_EMAIL và BOOTSTRAP_ADMIN_PASSWORD (>= 12 ký tự) và bảng staff rỗng
        String bootstrapEmail = System.getenv("BOOTSTRAP_ADMIN_EMAIL");
        String bootstrapPassword = System.getenv("BOOTSTRAP_ADMIN_PASSWORD");

        if (bootstrapEmail != null && !bootstrapEmail.trim().isEmpty()
                && bootstrapPassword != null && bootstrapPassword.length() >= 12
                && staffRepository.count() == 0) {
            String cleanEmail = bootstrapEmail.trim().toLowerCase();
            if (accountValidationService.isEmailTaken(cleanEmail)) {
                log.error("Không thể tạo bootstrap admin: email {} đã tồn tại trong hệ thống!", cleanEmail);
                return;
            }
            log.info("Khởi tạo tài khoản bootstrap admin từ biến môi trường...");
            Staff bootstrapAdmin = Staff.builder()
                    .fullName("Bootstrap Administrator")
                    .email(cleanEmail)
                    .role(StaffRole.admin)
                    .passwordHash(passwordEncoder.encode(bootstrapPassword))
                    .isActive(true)
                    .hiredAt(LocalDate.now())
                    .build();
            staffRepository.save(bootstrapAdmin);
            log.info("Đã tạo thành công tài khoản bootstrap admin cho email: {}", cleanEmail);
        }
    }
}
