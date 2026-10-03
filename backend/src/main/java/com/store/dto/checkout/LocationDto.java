package com.store.dto.checkout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class LocationDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Province {
        private String code;
        private String name;
        private List<District> districts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class District {
        private String code;
        private String name;
        private List<String> wards;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Ward {
        private String name;
    }
}
