package com.store.config;

import com.store.entity.Customer;
import com.store.entity.Staff;
import com.store.entity.StaffRole;
import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final StaffRepository staffRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Override
    public void run(String... args) {
        boolean isDev = environment != null && Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("dev") || p.equalsIgnoreCase("development"));

        if (isDev) {
            // Chỉ chạy ở profile dev
            if (staffRepository.count() == 0) {
                log.info("Profile dev: Khởi tạo tài khoản staff dev...");
                String devAdminPass = System.getenv().getOrDefault("DEV_ADMIN_PASSWORD", "DevAdmin@Pass2026!");
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

                String devSalesPass = System.getenv().getOrDefault("DEV_SALES_PASSWORD", "DevSales@Pass2026!");
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
                String devCustPass = System.getenv().getOrDefault("DEV_CUSTOMER_PASSWORD", "DevCust@Pass2026!");
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
            log.info("Khởi tạo tài khoản bootstrap admin từ biến môi trường...");
            Staff bootstrapAdmin = Staff.builder()
                    .fullName("Bootstrap Administrator")
                    .email(bootstrapEmail.trim().toLowerCase())
                    .role(StaffRole.admin)
                    .passwordHash(passwordEncoder.encode(bootstrapPassword))
                    .isActive(true)
                    .hiredAt(LocalDate.now())
                    .build();
            staffRepository.save(bootstrapAdmin);
            log.info("Đã tạo thành công tài khoản bootstrap admin cho email: {}", bootstrapEmail.trim().toLowerCase());
        }
    }
}
