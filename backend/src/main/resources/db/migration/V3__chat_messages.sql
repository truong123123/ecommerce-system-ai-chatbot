-- V3__chat_messages.sql
-- Table for storing AI chatbot session messages, tool invocations, and responses

CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    customer_id BIGINT NULL,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    tool_name VARCHAR(100) NULL,
    model VARCHAR(100) NULL,
    latency_ms INT NULL,
    fallback BOOLEAN NOT NULL DEFAULT FALSE,
    ip_hash VARCHAR(64) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_chat_messages_customer FOREIGN KEY (customer_id)
        REFERENCES customers (customer_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (created_at);
