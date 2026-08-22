package com.pathshala.controller;

import com.pathshala.config.KhaltiProperties;
import com.pathshala.dto.SubscriptionDtos;
import com.pathshala.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/payments/khalti")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final SubscriptionService subscriptions;
    private final KhaltiProperties properties;

    @GetMapping("/callback")
    public ResponseEntity<Void> callback(@RequestParam(required = false) String pidx) {
        Long id = subscriptions.paymentIdByPidx(pidx).orElse(null);
        String status = "FAILED";
        if (id != null) {
            try { status = subscriptions.refresh(id, null).status().name(); }
            catch (RuntimeException exception) { log.error("Khalti callback verification failed for paymentId={}", id, exception); status = "FAILED"; }
        }
        String target = properties.getWebsiteUrl() + "/admin/settings/subscription/payment-result?paymentId="
                + (id == null ? "" : id) + "&status=" + URLEncoder.encode(status, StandardCharsets.UTF_8);
        return ResponseEntity.status(HttpStatus.FOUND).header(HttpHeaders.LOCATION, URI.create(target).toASCIIString()).build();
    }
}
