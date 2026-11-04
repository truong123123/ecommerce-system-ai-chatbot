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

import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final org.springframework.core.env.Environment environment;

    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter, org.springframework.core.env.Environment environment) {
        this.jwtFilter = jwtFilter;
        this.environment = environment;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        boolean isProd = environment != null && java.util.Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));

        CsrfTokenRequestAttributeHandler csrfRequestHandler = new CsrfTokenRequestAttributeHandler();
        csrfRequestHandler.setCsrfRequestAttributeName(null);

        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfTokenRepository.setCookiePath("/");

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(csrfTokenRepository)
                .csrfTokenRequestHandler(csrfRequestHandler)
                .ignoringRequestMatchers("/auth/login", "/payment/callback/vnpay")
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
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
                        "/vouchers/validate", "/checkout/calculate", "/chat").permitAll()
                // CHỈ GET /payment/callback/vnpay công khai cho VNPAY IPN
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

                // 5. Admin & Staff RBAC phân quyền chi tiết
                // Kho vận & Chi nhánh: ADMIN, MANAGER, WAREHOUSE
                .requestMatchers("/admin/inventory", "/admin/inventory/**",
                        "/admin/stores", "/admin/stores/**").hasAnyRole("ADMIN", "MANAGER", "WAREHOUSE")
                // Giao dịch thanh toán: ADMIN, MANAGER, ACCOUNTANT, SALES
                .requestMatchers("/admin/payments", "/admin/payments/**").hasAnyRole("ADMIN", "MANAGER", "ACCOUNTANT", "SALES")
                // Khách hàng CRM: ADMIN, MANAGER, SALES, SUPPORT
                .requestMatchers("/admin/customers", "/admin/customers/**").hasAnyRole("ADMIN", "MANAGER", "SALES", "SUPPORT")
                // Khuyến mãi & Flash Sale: ADMIN, MANAGER, SALES
                .requestMatchers("/admin/flash-sales", "/admin/flash-sales/**", "/admin/flash-sale", "/admin/flash-sale/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/admin/coupons", "/admin/coupons/**").hasAnyRole("ADMIN", "MANAGER", "SALES")
                // Đánh giá & Hỗ trợ khách hàng: ADMIN, MANAGER, SUPPORT
                .requestMatchers("/admin/reviews", "/admin/reviews/**",
                        "/admin/support", "/admin/support/**").hasAnyRole("ADMIN", "MANAGER", "SUPPORT")
                // Quản trị Nhân viên & Cấu hình hệ thống: Chỉ ADMIN
                .requestMatchers("/admin/staff", "/admin/staff/**", "/admin/settings", "/admin/settings/**").hasRole("ADMIN")
                // Showcase & Banners: ADMIN, MANAGER
                .requestMatchers("/admin/category-showcase", "/admin/category-showcase/**",
                        "/admin/laptop-showcase", "/admin/laptop-showcase/**",
                        "/admin/watch-showcase", "/admin/watch-showcase/**",
                        "/admin/banners", "/admin/banners/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/categories/**", "/brands/**", "/products/**", "/banners/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/categories/**", "/brands/**", "/products/**", "/banners/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/categories/**", "/brands/**", "/products/**", "/banners/**").hasAnyRole("ADMIN", "MANAGER")
                // Các endpoint admin chung: Tất cả vai trò nhân sự hợp lệ
                .requestMatchers("/admin", "/admin/**").hasAnyRole("ADMIN", "MANAGER", "SALES", "WAREHOUSE", "SUPPORT", "ACCOUNTANT")

                // 6. Mặc định: Yêu cầu xác thực (deny-by-default)
                .anyRequest().authenticated();
            })
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(new CsrfCookieFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        java.util.List<String> origins = java.util.Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(java.util.stream.Collectors.toList());
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setExposedHeaders(java.util.List.of("Set-Cookie", "X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private static class CsrfCookieFilter extends org.springframework.web.filter.OncePerRequestFilter {
        @Override
        protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request,
                                        jakarta.servlet.http.HttpServletResponse response,
                                        jakarta.servlet.FilterChain filterChain)
                throws jakarta.servlet.ServletException, java.io.IOException {
            org.springframework.security.web.csrf.CsrfToken csrfToken =
                    (org.springframework.security.web.csrf.CsrfToken) request.getAttribute(org.springframework.security.web.csrf.CsrfToken.class.getName());
            if (csrfToken != null) {
                // Ép giải nén deferred CSRF token để Spring Security ghi cookie XSRF-TOKEN
                csrfToken.getToken();
            }
            filterChain.doFilter(request, response);
        }
    }
}
