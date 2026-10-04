package com.store.service;

import com.store.dto.checkout.*;
import com.store.entity.Customer;

import java.util.List;

public interface CheckoutService {

    CheckoutPreviewDto preview(Customer customer, List<Long> variantIds, List<Integer> quantities);

    CheckoutCalculateDto calculate(Customer customer, CheckoutCalculateRequest request);

    CheckoutSubmitResponse submitCheckout(Customer customer, String idempotencyKey, CheckoutSubmitRequest request, String ipAddress);

    boolean handlePaymentSuccess(String providerTxnRef, String gatewayTxnNo, String callbackPayload);

    boolean handlePaymentFailure(String providerTxnRef, String callbackPayload);

    void handleOrderCancellation(Long orderId);

    void releaseOrderReservations(Long orderId);

    void cleanupExpiredOrders();
}
