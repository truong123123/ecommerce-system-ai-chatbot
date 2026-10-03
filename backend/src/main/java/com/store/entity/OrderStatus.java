package com.store.entity;

public enum OrderStatus {
    pending,
    pending_payment,
    paid,
    confirmed,
    processing,
    shipped,
    completed,
    cancelled,
    expired,
    returned
}
