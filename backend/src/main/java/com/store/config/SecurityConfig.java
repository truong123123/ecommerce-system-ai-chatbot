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
    private final org.springframework.core.env.Environment environment;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter, org.springframework.core.env.Environment environment) {
        this.jwtFilter = jwtFilter;
        this.environment = environment;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        boolean isProd = environment != null && java.util.Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));

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
            .authorizeHttpRequests(auth -> {
                // Cho phép lỗi hệ thống và CORS preflight không bị chặn thành 401
                auth.dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ERROR).permitAll();
                auth.requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll();
                auth.requestMatchers("/error").permitAll();

                // Swagger / OpenAPI: Profile prod yêu cầu ADMIN, dev/test cho phép công khai
                if (isProd) {
                    auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").hasRole("ADMIN");
                } else {
                    auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll();
                }

                // 1. Công khai (Public endpoints)
                auth.requestMatchers("/auth/**", "/actuator/health", "/actuator/info").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET,
                        "/categories/**", "/brands/**", "/products/**",
                        "/banners/**", "/flash-sales/**", "/flash-sale/**",
                        "/locations/**", "/stores/**", "/payment-methods/**",
                        "/vouchers/**", "/reviews/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST,
                        "/vouchers/validate", "/checkout/calculate").permitAll()
                // CHỈ GET /payment/callback/vnpay công khai, mọi /payment/** khác yêu cầu đăng nhập
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/payment/callback/vnpay").permitAll()

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
                .anyRequest().authenticated();
            })
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
