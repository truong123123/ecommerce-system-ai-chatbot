package com.store.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DiscountType {
    percent,
    fixed;

    @JsonCreator
    public static DiscountType fromString(String val) {
        if (val == null) return null;
        String s = val.trim().toLowerCase();
        if (s.contains("percent")) {
            return percent;
        }
        return fixed;
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}
