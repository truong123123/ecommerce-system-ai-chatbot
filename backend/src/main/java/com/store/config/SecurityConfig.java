package com.store.config;

import com.store.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"status\":401,\"message\":\"Vui lòng đăng nhập để tiếp tục.\",\"errors\":{}}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"status\":403,\"message\":\"Bạn không có quyền thực hiện thao tác này.\",\"errors\":{}}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // 1. Công khai (Public endpoints)
                .requestMatchers("/auth/**", "/actuator/health", "/actuator/info", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET,
                        "/categories/**", "/brands/**", "/products/**",
                        "/banners/**", "/flash-sales/**", "/flash-sale/**",
                        "/locations/**", "/stores/**", "/payment-methods/**",
                        "/vouchers/**", "/reviews/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST,
                        "/vouchers/validate", "/checkout/calculate").permitAll()
                .requestMatchers("/payment/callback/**").permitAll()

                // 2. Review write endpoints (Phải đứng trước quy tắc tổng quát /products/**)
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/products/*/reviews", "/products/*/reviews/**", "/reviews/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/reviews/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/reviews/**").authenticated()

                // 3. Khách hàng đã đăng nhập (Authenticated Customer)
                .requestMatchers("/cart/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/checkout/preview").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/checkout", "/flash-sales/checkout", "/flash-sale/checkout", "/payment/vnpay").authenticated()
                .requestMatchers("/account/**", "/wishlist/**", "/orders/**").authenticated()

                // 4. Dashboard: Chỉ ADMIN, MANAGER, ACCOUNTANT
                .requestMatchers("/dashboard/**").hasAnyRole("ADMIN", "MANAGER", "ACCOUNTANT")

                // 5. Admin & Staff RBAC
                .requestMatchers("/admin/**").hasAnyRole("ADMIN", "MANAGER", "SALES", "WAREHOUSE", "SUPPORT", "ACCOUNTANT")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/categories/**", "/brands/**", "/products/**", "/banners/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/categories/**", "/brands/**", "/products/**", "/banners/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/categories/**", "/brands/**", "/products/**", "/banners/**").hasAnyRole("ADMIN", "MANAGER")

                // 6. Mặc định: Yêu cầu xác thực (deny-by-default)
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
