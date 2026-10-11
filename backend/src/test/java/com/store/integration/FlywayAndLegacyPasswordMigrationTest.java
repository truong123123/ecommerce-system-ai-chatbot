package com.store.integration;

import com.store.entity.Customer;
import com.store.repository.CustomerRepository;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.sql.DataSource;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class FlywayAndLegacyPasswordMigrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("store_dev")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (postgres != null && postgres.isRunning()) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
        }
    }

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomerRepository customerRepository;

    @Test
    @DisplayName("BƯỚC 8: Migration V2 băm mật khẩu plaintext sang BCrypt và khóa GUEST_NO_PASSWORD thành !NO_LOGIN")
    void testFlywayV2Migration_hashesPlaintextAndLocksGuests() {
        // 1. Chạy Flyway migrate để đảm bảo schema đã ở version 2
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .load();
        flyway.migrate();

        // 2. Kiểm chứng lịch sử Flyway ghi nhận V2 thành công
        Boolean v2Success = jdbcTemplate.queryForObject(
                "SELECT success FROM flyway_schema_history WHERE version = '2'",
                Boolean.class
        );
        assertNotNull(v2Success, "Bản ghi V2 trong flyway_schema_history không được null");
        assertTrue(v2Success, "Flyway migration V2 phải thực thi thành công");

        // 3. Kiểm chứng không còn bất kỳ tài khoản nào mang password_hash = 'GUEST_NO_PASSWORD'
        Integer guestCount = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM customers WHERE password_hash = 'GUEST_NO_PASSWORD'",
                Integer.class
        );
        assertEquals(0, guestCount, "Không được còn tài khoản nào mang hash GUEST_NO_PASSWORD");

        // 4. Kiểm chứng không còn bất kỳ tài khoản customers nào có mật khẩu plaintext chưa băm
        Integer plaintextCustCount = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM customers WHERE password_hash NOT LIKE '$2%' AND password_hash NOT LIKE '!%'",
                Integer.class
        );
        assertEquals(0, plaintextCustCount, "Không được còn mật khẩu plaintext chưa băm trong customers");

        // 5. Kiểm chứng không còn bất kỳ tài khoản staff nào có mật khẩu plaintext chưa băm
        Integer plaintextStaffCount = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM staff WHERE password_hash NOT LIKE '$2%' AND password_hash NOT LIKE '!%'",
                Integer.class
        );
        assertEquals(0, plaintextStaffCount, "Không được còn mật khẩu plaintext chưa băm trong staff");

        // 6. Kiểm chứng trực tiếp thuật toán SQL của V2 trên dữ liệu mẫu mới
        String guestEmail = "guest_mig_" + UUID.randomUUID() + "@store.com";
        String plaintextEmail = "plaintext_mig_" + UUID.randomUUID() + "@store.com";
        String rawSecret = "LegacyP@ssword2026";

        jdbcTemplate.update(
                "INSERT INTO customers (full_name, email, password_hash, is_active, loyalty_points) VALUES (?, ?, ?, ?, ?)",
                "Guest Test", guestEmail, "GUEST_NO_PASSWORD", true, 0
        );

        jdbcTemplate.update(
                "INSERT INTO customers (full_name, email, password_hash, is_active, loyalty_points) VALUES (?, ?, ?, ?, ?)",
                "Plaintext User", plaintextEmail, rawSecret, true, 0
        );

        // Áp dụng biến đổi của V2
        jdbcTemplate.update("UPDATE customers SET password_hash = '!NO_LOGIN' WHERE password_hash = 'GUEST_NO_PASSWORD'");
        jdbcTemplate.update("UPDATE customers SET password_hash = crypt(password_hash, gen_salt('bf', 10)) WHERE password_hash NOT LIKE '$2%' AND password_hash NOT LIKE '!%'");

        try {
            Customer migratedGuest = customerRepository.findByEmailIgnoreCase(guestEmail).orElseThrow();
            assertEquals("!NO_LOGIN", migratedGuest.getPasswordHash(),
                    "Tài khoản guest phải được chuyển đổi thành '!NO_LOGIN'");

            Customer migratedPlaintext = customerRepository.findByEmailIgnoreCase(plaintextEmail).orElseThrow();
            String newHash = migratedPlaintext.getPasswordHash();
            assertNotNull(newHash);
            assertTrue(newHash.startsWith("$2a$10$"), "Mật khẩu sau migration phải là định dạng BCrypt $2a$10$");
            assertNotEquals(rawSecret, newHash, "Mật khẩu không được lưu ở dạng plaintext");

            // Khớp mật khẩu gốc
            assertTrue(passwordEncoder.matches(rawSecret, newHash),
                    "Sau migration, người dùng vẫn phải đăng nhập được bằng mật khẩu gốc");

            // Mật khẩu sai bị từ chối
            assertFalse(passwordEncoder.matches("WrongPassword!123", newHash),
                    "Mật khẩu sai phải bị từ chối");
        } finally {
            jdbcTemplate.update("DELETE FROM customers WHERE email IN (?, ?)", guestEmail, plaintextEmail);
        }
    }
}
