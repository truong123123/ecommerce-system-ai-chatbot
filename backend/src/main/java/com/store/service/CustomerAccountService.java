package com.store.service;

import com.store.dto.account.*;

import java.util.List;

public interface CustomerAccountService {
    CustomerProfileDto getProfile(String email);
    CustomerProfileDto updateProfile(String email, UpdateProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);

    List<AddressDto> getAddresses(String email);
    AddressDto addAddress(String email, CreateAddressRequest request);
    AddressDto updateAddress(String email, Long addressId, CreateAddressRequest request);
    void deleteAddress(String email, Long addressId);
    AddressDto setDefaultAddress(String email, Long addressId);

    List<CustomerOrderDetailDto> getOrders(String email, String status);
    CustomerOrderDetailDto getOrderDetail(String email, Long orderId);
}
