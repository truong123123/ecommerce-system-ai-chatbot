package com.store.security;

import com.store.service.AuthCookieService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final AuthCookieService authCookieService;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, AuthCookieService authCookieService) {
        this.tokenProvider = tokenProvider;
        this.authCookieService = authCookieService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Đọc cookie trước
        String token = authCookieService.extractToken(request).orElse(null);

        // 2. Nếu cookie không có, mới đọc Bearer header
        if (token == null || token.isBlank()) {
            String bearerToken = request.getHeader("Authorization");
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                token = bearerToken.substring(7).trim();
            }
        }

        // 3. Chỉ parse JWT một lần duy nhất / request
        if (token != null && !token.isBlank()) {
            Claims claims = tokenProvider.parseAndValidateToken(token);
            if (claims != null) {
                String email = claims.getSubject();
                String role = claims.get("role", String.class);
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                if (role != null && !role.isBlank()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase()));
                }
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
