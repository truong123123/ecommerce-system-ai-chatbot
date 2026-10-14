package com.store.controller;

import com.store.chat.service.ChatService;
import com.store.dto.chat.ChatRequest;
import com.store.dto.chat.ChatResponse;
import com.store.entity.Customer;
import com.store.repository.CustomerRepository;
import com.store.util.ClientIpUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Chat Assistant", description = "Endpoints cho trợ lý tư vấn bán hàng AI tự động với tool-calling")
public class ChatController {

    private final ChatService chatService;
    private final CustomerRepository customerRepository;
    private final ClientIpUtil clientIpUtil;

    @Operation(summary = "Gửi tin nhắn đến Trợ lý AI", description = "Endpoint công khai hỗ trợ khách vãng lai và khách hàng đã đăng nhập. Tự động nhận diện quyền và thực thi các tool tra cứu sản phẩm, tồn kho, đơn hàng, chính sách.")
    @ApiResponse(responseCode = "200", description = "Trợ lý AI phản hồi thành công")
    @ApiResponse(responseCode = "400", description = "Dữ liệu tin nhắn hoặc lịch sử không hợp lệ")
    @ApiResponse(responseCode = "429", description = "Vượt quá giới hạn tần suất gửi tin nhắn (Rate limit)")
    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request,
            HttpServletRequest servletRequest
    ) {
        String clientIp = clientIpUtil.extractClientIp(servletRequest);

        Customer currentCustomer = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equalsIgnoreCase(auth.getName())) {
            currentCustomer = customerRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
        }

        ChatResponse response = chatService.processChat(request, currentCustomer, clientIp);
        return ResponseEntity.ok(response);
    }
}
