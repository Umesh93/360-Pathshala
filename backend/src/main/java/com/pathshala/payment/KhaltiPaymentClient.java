package com.pathshala.payment;

import java.math.BigDecimal;

public interface KhaltiPaymentClient {
    Initiation initiate(InitiationRequest request);
    Lookup lookup(String pidx);

    record InitiationRequest(long amountPaisa, String purchaseOrderId, String productName,
                             String returnUrl, String customerName, String customerEmail, String customerPhone) {}
    record Initiation(String pidx, String paymentUrl, String status, String rawResponse) {}
    record Lookup(String pidx, String status, Long totalAmountPaisa, String purchaseOrderId,
                  String transactionId, String rawResponse) {}
}
