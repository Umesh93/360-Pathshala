package com.pathshala.service;

import com.pathshala.dto.DemoDtos.AdminConversionHistoryResponse;
import com.pathshala.dto.DemoDtos.ConversionDetailResponse;

import java.util.List;

public interface DemoConversionHistoryService {
    AdminConversionHistoryResponse createConversionHistory(
            Long demoRequestId,
            Long demoSchoolId,
            Long paidSchoolId,
            String schoolName,
            Long convertedBy,
            String convertedByName,
            String initialSubscriptionPlan,
            Integer subscriptionDuration,
            String enabledModules,
            String paymentReference,
            String paymentMethod,
            String paymentAmount,
            String currency,
            String remarks
    );

    List<AdminConversionHistoryResponse> findAll();
    AdminConversionHistoryResponse findByConversionCode(String conversionCode);
    AdminConversionHistoryResponse findByDemoSchoolId(Long demoSchoolId);
    AdminConversionHistoryResponse findByPaidSchoolId(Long paidSchoolId);
    ConversionDetailResponse getConversionDetail(Long id);
}
