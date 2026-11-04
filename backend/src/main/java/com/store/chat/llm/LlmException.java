package com.store.chat.llm;

import lombok.Getter;

@Getter
public class LlmException extends RuntimeException {

    private final int statusCode;
    private final boolean dailyQuota;

    public LlmException(String message) {
        this(message, 0, false, null);
    }

    public LlmException(String message, Throwable cause) {
        this(message, 0, false, cause);
    }

    public LlmException(String message, int statusCode, boolean dailyQuota, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
        this.dailyQuota = dailyQuota;
    }
}
