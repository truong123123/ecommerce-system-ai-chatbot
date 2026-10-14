package com.store.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {

    @NotBlank(message = "Role không được để trống")
    private String role;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Size(max = 1000, message = "Nội dung tin nhắn trong lịch sử tối đa 1000 ký tự")
    private String content;
}
