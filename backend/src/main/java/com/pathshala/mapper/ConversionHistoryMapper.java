package com.pathshala.mapper;

import com.pathshala.dto.DemoDtos.AdminConversionHistoryResponse;
import com.pathshala.entity.DemoConversionHistory;

import java.time.format.DateTimeFormatter;

public class ConversionHistoryMapper {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE;

    public static AdminConversionHistoryResponse toResponse(DemoConversionHistory history, String convertedByName) {
        return new AdminConversionHistoryResponse(
                history.getId(),
                history.getConversionCode(),
                history.getDemoRequestId(),
                history.getDemoSchoolId(),
                history.getPaidSchoolId(),
                history.getSchoolName(),
                history.getConvertedBy(),
                convertedByName,
                history.getConversionDate() != null ? history.getConversionDate().format(DATE_FORMATTER) : null,
                history.getInitialSubscriptionPlan(),
                history.getSubscriptionDuration(),
                history.getEnabledModules(),
                history.getPaymentReference(),
                history.getPaymentMethod(),
                history.getPaymentAmount() != null ? history.getPaymentAmount().toPlainString() : null,
                history.getCurrency(),
                history.getRemarks(),
                history.getCreatedAt() != null ? history.getCreatedAt().toString() : null
        );
    }
}
