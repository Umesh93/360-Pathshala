package com.pathshala.controller;

import com.pathshala.dto.SubscriptionDtos;
import com.pathshala.service.SubscriptionService;
import com.pathshala.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/subscriptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
public class SubscriptionController {
    private final SubscriptionService subscriptions;
    private final SecurityUtils security;

    @GetMapping("/plans") public List<SubscriptionDtos.Plan> plans() { return subscriptions.listPlans(false); }
    @GetMapping("/features") public List<SubscriptionDtos.Feature> features() { return subscriptions.listFeatures(); }
    @GetMapping("/current") public SubscriptionDtos.CurrentSubscription current() { return subscriptions.current(security.requiredSchoolId()); }
    @GetMapping("/payments") public List<SubscriptionDtos.Payment> payments() { return subscriptions.paymentHistory(security.requiredSchoolId()); }
    @PostMapping("/payment/initiate") public SubscriptionDtos.Payment initiate(@Valid @RequestBody SubscriptionDtos.InitiateRequest request) { return subscriptions.initiate(request.featureCodes()); }
    @GetMapping("/payments/{id}") public SubscriptionDtos.Payment payment(@PathVariable Long id) { return subscriptions.payment(id, security.requiredSchoolId()); }
    @PostMapping("/payments/{id}/refresh") public SubscriptionDtos.Payment refresh(@PathVariable Long id) { return subscriptions.refresh(id, security.requiredSchoolId()); }
}
