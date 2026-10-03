package com.store.config;

import com.store.entity.Customer;
import com.store.entity.Staff;
import com.store.entity.StaffRole;
import com.store.repository.CustomerRepository;
import com.store.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final StaffRepository staffRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Khởi tạo tài khoản Quản trị & Nhân viên nếu bảng staff chưa có
        if (staffRepository.count() == 0) {
            log.info("Khởi tạo tài khoản Staff mặc định vào PostgreSQL...");

            Staff admin = Staff.builder()
                    .fullName("Nguyễn Văn Admin")
                    .email("admin@store.com")
                    .role(StaffRole.admin)
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .phone("0988888888")
                    .isActive(true)
                    .hiredAt(LocalDate.now())
                    .lastLoginAt(OffsetDateTime.now())
                    .build();
            staffRepository.save(admin);

            Staff sales = Staff.builder()
                    .fullName("Trần Thị Sales")
                    .email("sales@store.com")
                    .role(StaffRole.sales)
                    .passwordHash(passwordEncoder.encode("sales123"))
                    .phone("0977777777")
                    .isActive(true)
                    .hiredAt(LocalDate.now())
                    .build();
            staffRepository.save(sales);

            log.info("Đã tạo thành công tài khoản: admin@store.com / admin123 (Role: admin)");
            log.info("Đã tạo thành công tài khoản: sales@store.com / sales123 (Role: sales)");
        }

        // 2. Khởi tạo tài khoản Khách hàng nếu bảng customers chưa có
        if (customerRepository.count() == 0) {
            log.info("Khởi tạo tài khoản Khách hàng mẫu vào PostgreSQL...");

            Customer customer = Customer.builder()
                    .fullName("Nguyễn Khách Hàng")
                    .email("customer@store.com")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .phone("0901234567")
                    .gender("M")
                    .birthDate(LocalDate.of(1998, 5, 20))
                    .loyaltyPoints(100)
                    .isActive(true)
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();
            customerRepository.save(customer);

            log.info("Đã tạo thành công tài khoản Khách hàng: customer@store.com / 123456");
        }
    }
}
