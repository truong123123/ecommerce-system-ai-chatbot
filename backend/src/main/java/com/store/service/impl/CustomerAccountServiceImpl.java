package com.store.service.impl;

import com.store.dto.account.*;
import com.store.entity.*;
import com.store.repository.*;
import com.store.service.CustomerAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerAccountServiceImpl implements CustomerAccountService {

    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final OrderRepository orderRepository;
    private final WishlistRepository wishlistRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReviewRepository reviewRepository;

    private Customer getCustomerByEmail(String email) {
        return customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin khách hàng với email: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerProfileDto getProfile(String email) {
        Customer customer = getCustomerByEmail(email);
        List<Order> orders = orderRepository.findByCustomerCustomerIdOrderByOrderDateDesc(customer.getCustomerId());
        int wishlistCount = wishlistRepository.countByCustomerCustomerId(customer.getCustomerId());

        int points = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;
        String tierName = points >= 2000 ? "Thành viên Kim Cương" : (points >= 500 ? "Thành viên VIP" : "Thành viên Thường");

        return CustomerProfileDto.builder()
                .id(customer.getCustomerId())
                .fullName(customer.getFullName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .gender(customer.getGender())
                .birthDate(customer.getBirthDate())
                .loyaltyPoints(points)
                .tierName(tierName)
                .orderCount(orders.size())
                .wishlistCount(wishlistCount)
                .createdAt(customer.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public CustomerProfileDto updateProfile(String email, UpdateProfileRequest request) {
        Customer customer = getCustomerByEmail(email);

        customer.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) {
            customer.setPhone(request.getPhone().trim());
        }
        if (request.getGender() != null) {
            customer.setGender(request.getGender().trim());
        }
        if (request.getBirthDate() != null) {
            customer.setBirthDate(request.getBirthDate());
        }

        customerRepository.save(customer);
        return getProfile(email);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        Customer customer = getCustomerByEmail(email);

        boolean matches = passwordEncoder.matches(request.getCurrentPassword(), customer.getPasswordHash())
                || request.getCurrentPassword().equals(customer.getPasswordHash());

        if (!matches) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác.");
        }

        customer.setPasswordHash(passwordEncoder.encode(request.getNewPassword().trim()));
        customerRepository.save(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressDto> getAddresses(String email) {
        Customer customer = getCustomerByEmail(email);
        return customerAddressRepository.findByCustomerCustomerId(customer.getCustomerId()).stream()
                .map(this::mapToAddressDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressDto addAddress(String email, CreateAddressRequest request) {
        Customer customer = getCustomerByEmail(email);
        boolean isFirst = customerAddressRepository.findByCustomerCustomerId(customer.getCustomerId()).isEmpty();
        boolean makeDefault = Boolean.TRUE.equals(request.getIsDefault()) || isFirst;

        if (makeDefault) {
            unsetDefaultAddresses(customer.getCustomerId());
        }

        CustomerAddress address = CustomerAddress.builder()
                .customer(customer)
                .receiverName(request.getReceiverName().trim())
                .receiverPhone(request.getReceiverPhone().trim())
                .province(request.getProvince().trim())
                .district(request.getDistrict().trim())
                .ward(request.getWard() != null ? request.getWard().trim() : "")
                .streetAddress(request.getStreetAddress().trim())
                .isDefault(makeDefault)
                .build();

        address = customerAddressRepository.save(address);
        return mapToAddressDto(address);
    }

    @Override
    @Transactional
    public AddressDto updateAddress(String email, Long addressId, CreateAddressRequest request) {
        Customer customer = getCustomerByEmail(email);
        CustomerAddress address = customerAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy địa chỉ với ID: " + addressId));

        if (!address.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new SecurityException("Bạn không có quyền chỉnh sửa địa chỉ của người khác.");
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetDefaultAddresses(customer.getCustomerId());
            address.setIsDefault(true);
        }

        address.setReceiverName(request.getReceiverName().trim());
        address.setReceiverPhone(request.getReceiverPhone().trim());
        address.setProvince(request.getProvince().trim());
        address.setDistrict(request.getDistrict().trim());
        address.setWard(request.getWard() != null ? request.getWard().trim() : "");
        address.setStreetAddress(request.getStreetAddress().trim());

        address = customerAddressRepository.save(address);
        return mapToAddressDto(address);
    }

    @Override
    @Transactional
    public void deleteAddress(String email, Long addressId) {
        Customer customer = getCustomerByEmail(email);
        CustomerAddress address = customerAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy địa chỉ với ID: " + addressId));

        if (!address.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new SecurityException("Bạn không có quyền xóa địa chỉ của người khác.");
        }

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        customerAddressRepository.delete(address);

        if (wasDefault) {
            List<CustomerAddress> remaining = customerAddressRepository.findByCustomerCustomerId(customer.getCustomerId());
            if (!remaining.isEmpty()) {
                remaining.get(0).setIsDefault(true);
                customerAddressRepository.save(remaining.get(0));
            }
        }
    }

    @Override
    @Transactional
    public AddressDto setDefaultAddress(String email, Long addressId) {
        Customer customer = getCustomerByEmail(email);
        CustomerAddress address = customerAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy địa chỉ với ID: " + addressId));

        if (!address.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new SecurityException("Bạn không có quyền thao tác trên địa chỉ của người khác.");
        }

        unsetDefaultAddresses(customer.getCustomerId());
        address.setIsDefault(true);
        address = customerAddressRepository.save(address);
        return mapToAddressDto(address);
    }

    private void unsetDefaultAddresses(Long customerId) {
        List<CustomerAddress> addresses = customerAddressRepository.findByCustomerCustomerId(customerId);
        for (CustomerAddress addr : addresses) {
            if (Boolean.TRUE.equals(addr.getIsDefault())) {
                addr.setIsDefault(false);
                customerAddressRepository.save(addr);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerOrderDetailDto> getOrders(String email, String status) {
        Customer customer = getCustomerByEmail(email);
        List<Order> orders = orderRepository.findByCustomerCustomerIdOrderByOrderDateDesc(customer.getCustomerId());

        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            orders = orders.stream()
                    .filter(o -> o.getStatus() != null && o.getStatus().name().equalsIgnoreCase(status.trim()))
                    .collect(Collectors.toList());
        }

        return orders.stream()
                .map(this::mapToOrderDetailDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerOrderDetailDto getOrderDetail(String email, Long orderId) {
        Customer customer = getCustomerByEmail(email);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với ID: " + orderId));

        // CHỐNG IDOR: Nghiêm cấm xem đơn của khách hàng khác
        if (order.getCustomer() == null || !order.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new SecurityException("Bạn không có quyền truy cập thông tin đơn hàng này.");
        }

        return mapToOrderDetailDto(order);
    }

    private AddressDto mapToAddressDto(CustomerAddress a) {
        String full = String.format("%s, %s, %s, %s",
                a.getStreetAddress(),
                a.getWard() != null ? a.getWard() : "",
                a.getDistrict(),
                a.getProvince()).replaceAll(", ,", ",").trim();

        return AddressDto.builder()
                .id(a.getAddressId())
                .receiverName(a.getReceiverName())
                .receiverPhone(a.getReceiverPhone())
                .province(a.getProvince())
                .district(a.getDistrict())
                .ward(a.getWard())
                .streetAddress(a.getStreetAddress())
                .isDefault(a.getIsDefault())
                .fullAddress(full)
                .build();
    }

    private CustomerOrderDetailDto mapToOrderDetailDto(Order order) {
        List<CustomerOrderDetailDto.OrderItemSummaryDto> items = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Long prodId = null;
                String prodImg = item.getProductImageSnapshot();
                if (item.getVariant() != null && item.getVariant().getProduct() != null) {
                    prodId = item.getVariant().getProduct().getProductId();
                }

                Long reviewId = null;
                if (item.getOrderItemId() != null) {
                    Optional<Review> revOpt = reviewRepository.findByOrderItemOrderItemId(item.getOrderItemId());
                    if (revOpt.isPresent()) {
                        reviewId = revOpt.get().getReviewId();
                    } else if (prodId != null && order.getCustomer() != null) {
                        Optional<Review> prodRevOpt = reviewRepository.findByProductProductIdAndCustomerCustomerId(prodId, order.getCustomer().getCustomerId());
                        if (prodRevOpt.isPresent()) {
                            reviewId = prodRevOpt.get().getReviewId();
                        }
                    }
                }

                boolean canReview = (order.getStatus() == OrderStatus.completed && item.getOrderItemId() != null && reviewId == null);

                items.add(CustomerOrderDetailDto.OrderItemSummaryDto.builder()
                        .orderItemId(item.getOrderItemId())
                        .productId(prodId)
                        .variantId(item.getVariant() != null ? item.getVariant().getVariantId() : null)
                        .productName(item.getProductNameSnapshot())
                        .productImage(prodImg)
                        .sku(item.getVariant() != null ? item.getVariant().getSku() : null)
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .lineTotal(item.getLineTotal() != null ? item.getLineTotal() : item.getUnitPrice().multiply(new java.math.BigDecimal(item.getQuantity())))
                        .canReview(canReview)
                        .reviewId(reviewId)
                        .build());
            }
        }

        String statusLabel = switch (order.getStatus()) {
            case pending -> "Chờ xác nhận";
            case pending_payment -> "Chờ thanh toán";
            case paid -> "Đã thanh toán";
            case confirmed -> "Đã xác nhận";
            case processing -> "Đang đóng gói";
            case shipped -> "Đang giao hàng";
            case completed -> "Giao thành công";
            case cancelled -> "Đã hủy";
            case expired -> "Hết hạn";
            case returned -> "Đã hoàn trả";
            default -> order.getStatus().name();
        };

        String addressStr = "";
        String receiverName = order.getCustomerName() != null ? order.getCustomerName() : "";
        String receiverPhone = order.getCustomerPhone() != null ? order.getCustomerPhone() : "";
        if (order.getShippingStreet() != null || order.getShippingProvince() != null) {
            addressStr = String.format("%s, %s, %s, %s",
                    order.getShippingStreet() != null ? order.getShippingStreet() : "",
                    order.getShippingWard() != null ? order.getShippingWard() : "",
                    order.getShippingDistrict() != null ? order.getShippingDistrict() : "",
                    order.getShippingProvince() != null ? order.getShippingProvince() : "").replaceAll(", ,", ",").trim();
        }

        String paymentStatus = (order.getStatus() == OrderStatus.paid || order.getStatus() == OrderStatus.completed) ? "PAID" : "UNPAID";

        return CustomerOrderDetailDto.builder()
                .orderId(order.getOrderId())
                .orderCode(order.getOrderCode())
                .orderDate(order.getOrderDate())
                .status(order.getStatus().name())
                .statusLabel(statusLabel)
                .totalAmount(order.getTotalAmount())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod() : "STORE")
                .paymentStatus(paymentStatus)
                .receiverName(receiverName)
                .receiverPhone(receiverPhone)
                .shippingAddress(addressStr)
                .storeName(null)
                .items(items)
                .build();
    }
}
