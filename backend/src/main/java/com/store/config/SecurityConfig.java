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
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/categories/**", "/brands/**", "/products/**", "/dashboard/**", "/banners/**", "/flash-sales/**", "/flash-sale/**", "/orders/**", "/chat/**", "/payment/**", "/locations/**", "/stores/**", "/payment-methods/**", "/vouchers/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/vouchers/validate", "/checkout/calculate", "/payment/**").permitAll()
                .requestMatchers("/admin/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/categories/**", "/brands/**", "/products/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/categories/**", "/brands/**", "/products/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/categories/**", "/brands/**", "/products/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/account/**").authenticated()
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
