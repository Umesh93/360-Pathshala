package com.pathshala.service;

import com.pathshala.entity.PaymentTransaction;
import com.pathshala.payment.KhaltiPaymentClient;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class SubscriptionServiceContractTest {
    @Test void paisaConvertsWholeNpr() { assertEquals(10000, SubscriptionService.toPaisa(new BigDecimal("100.00"))); }
    @Test void paisaConvertsFractionalNprExactly() { assertEquals(12345, SubscriptionService.toPaisa(new BigDecimal("123.45"))); }
    @Test void paisaRejectsSubPaisaPrecision() { assertThrows(ArithmeticException.class, () -> SubscriptionService.toPaisa(new BigDecimal("1.001"))); }
    @Test void orderHasRequiredPrefixAndDate() { assertTrue(SubscriptionService.orderId().matches("360P-\\d{8}-[0-9a-f-]{36}")); }
    @Test void ordersAreUnique() { assertNotEquals(SubscriptionService.orderId(), SubscriptionService.orderId()); }
    @Test void completedMaps() { assertEquals(PaymentTransaction.Status.COMPLETED, SubscriptionService.mapStatus("Completed")); }
    @Test void completedMappingIsCaseNormalized() { assertEquals(PaymentTransaction.Status.COMPLETED, SubscriptionService.mapStatus("COMPLETED")); }
    @Test void pendingMaps() { assertEquals(PaymentTransaction.Status.PENDING, SubscriptionService.mapStatus("Pending")); }
    @Test void initiatedMapsToPending() { assertEquals(PaymentTransaction.Status.PENDING, SubscriptionService.mapStatus("Initiated")); }
    @Test void userCanceledMaps() { assertEquals(PaymentTransaction.Status.CANCELLED, SubscriptionService.mapStatus("User canceled")); }
    @Test void britishCancelledMaps() { assertEquals(PaymentTransaction.Status.CANCELLED, SubscriptionService.mapStatus("Cancelled")); }
    @Test void expiredMaps() { assertEquals(PaymentTransaction.Status.EXPIRED, SubscriptionService.mapStatus("Expired")); }
    @Test void refundedMaps() { assertEquals(PaymentTransaction.Status.REFUNDED, SubscriptionService.mapStatus("Refunded")); }
    @Test void unknownMapsFailed() { assertEquals(PaymentTransaction.Status.FAILED, SubscriptionService.mapStatus("Anything else")); }
    @Test void nullMapsFailed() { assertEquals(PaymentTransaction.Status.FAILED, SubscriptionService.mapStatus(null)); }

    @Test void lookupAcceptsMatchingImmutableValues() {
        PaymentTransaction p = payment();
        assertDoesNotThrow(() -> SubscriptionService.validateLookup(p, lookup("PX", 250000L, "ORDER")));
    }
    @Test void lookupAcceptsAuthoritativeKhaltiResponseWithoutOrderId() {
        PaymentTransaction p = payment();
        assertDoesNotThrow(() -> SubscriptionService.validateLookup(p, lookup("PX", 250000L, null)));
    }
    @Test void lookupRejectsUnknownPidx() {
        assertThrows(IllegalArgumentException.class, () -> SubscriptionService.validateLookup(payment(), lookup("OTHER", 250000L, "ORDER")));
    }
    @Test void lookupRejectsAmountMismatch() {
        assertThrows(IllegalArgumentException.class, () -> SubscriptionService.validateLookup(payment(), lookup("PX", 1L, "ORDER")));
    }
    @Test void lookupRejectsMissingAmount() {
        assertThrows(IllegalArgumentException.class, () -> SubscriptionService.validateLookup(payment(), lookup("PX", null, "ORDER")));
    }
    @Test void lookupRejectsOrderMismatch() {
        assertThrows(IllegalArgumentException.class, () -> SubscriptionService.validateLookup(payment(), lookup("PX", 250000L, "OTHER")));
    }
    @Test void lookupAcceptsBlankMissingOrder() {
        assertDoesNotThrow(() -> SubscriptionService.validateLookup(payment(), lookup("PX", 250000L, "")));
    }
    @Test void lookupDoesNotExposeSecretData() {
        KhaltiPaymentClient.Lookup lookup = lookup("PX", 250000L, "ORDER");
        assertFalse(lookup.toString().toLowerCase().contains("secret"));
        assertFalse(lookup.toString().contains("Authorization"));
    }

    private static PaymentTransaction payment() {
        PaymentTransaction p = new PaymentTransaction(); p.setPidx("PX"); p.setAmountPaisa(250000); p.setPurchaseOrderId("ORDER"); return p;
    }
    private static KhaltiPaymentClient.Lookup lookup(String pidx, Long amount, String order) {
        return new KhaltiPaymentClient.Lookup(pidx, "Completed", amount, order, "TX", "{}");
    }
}
