package com.pathshala.service.impl;

import com.pathshala.dto.DemoDtos.AdminConversionHistoryResponse;
import com.pathshala.dto.DemoDtos.ConversionDetailResponse;
import com.pathshala.entity.DemoConversionHistory;
import com.pathshala.entity.DemoRequest;
import com.pathshala.entity.DemoSchool;
import com.pathshala.entity.School;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.mapper.ConversionHistoryMapper;
import com.pathshala.repository.Repositories.DemoConversionHistoryRepository;
import com.pathshala.repository.Repositories.DemoRequestRepository;
import com.pathshala.repository.Repositories.DemoSchoolRepository;
import com.pathshala.repository.Repositories.SchoolRepository;
import com.pathshala.repository.Repositories.UserRepository;
import com.pathshala.service.DemoConversionHistoryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemoConversionHistoryServiceImpl implements DemoConversionHistoryService {
    private final DemoConversionHistoryRepository conversionHistoryRepository;
    private final DemoRequestRepository demoRequestRepository;
    private final DemoSchoolRepository demoSchoolRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AdminConversionHistoryResponse createConversionHistory(
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
    ) {
        log.info("Creating conversion history: demoSchoolId={}, paidSchoolId={}", demoSchoolId, paidSchoolId);

        DemoConversionHistory history = new DemoConversionHistory();
        history.setConversionCode(generateConversionCode());
        history.setDemoRequestId(demoRequestId);
        history.setDemoSchoolId(demoSchoolId);
        history.setPaidSchoolId(paidSchoolId);
        history.setSchoolName(schoolName);
        history.setConvertedBy(convertedBy);
        history.setConversionDate(LocalDate.now());
        history.setInitialSubscriptionPlan(initialSubscriptionPlan);
        history.setSubscriptionDuration(subscriptionDuration);
        history.setEnabledModules(enabledModules);
        history.setPaymentReference(paymentReference);
        history.setPaymentMethod(paymentMethod);
        history.setPaymentAmount(paymentAmount != null ? new BigDecimal(paymentAmount) : null);
        history.setCurrency(currency != null ? currency : "NPR");
        history.setRemarks(remarks != null ? remarks.trim() : null);

        DemoConversionHistory saved = conversionHistoryRepository.save(history);
        log.info("Conversion history created: id={}, code={}", saved.getId(), saved.getConversionCode());

        return ConversionHistoryMapper.toResponse(saved, convertedByName);
    }

    @Override
    public List<AdminConversionHistoryResponse> findAll() {
        return conversionHistoryRepository.findAll().stream()
                .map(history -> ConversionHistoryMapper.toResponse(history, getConvertedByName(history.getConvertedBy())))
                .toList();
    }

    @Override
    public AdminConversionHistoryResponse findByConversionCode(String conversionCode) {
        DemoConversionHistory history = conversionHistoryRepository.findAll().stream()
                .filter(h -> conversionCode.equals(h.getConversionCode()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Conversion history not found"));
        return ConversionHistoryMapper.toResponse(history, getConvertedByName(history.getConvertedBy()));
    }

    @Override
    public AdminConversionHistoryResponse findByDemoSchoolId(Long demoSchoolId) {
        DemoConversionHistory history = conversionHistoryRepository.findByDemoSchoolIdAndDeletedFalse(demoSchoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversion history not found for this demo school"));
        return ConversionHistoryMapper.toResponse(history, getConvertedByName(history.getConvertedBy()));
    }

    @Override
    public AdminConversionHistoryResponse findByPaidSchoolId(Long paidSchoolId) {
        DemoConversionHistory history = conversionHistoryRepository.findByPaidSchoolIdAndDeletedFalse(paidSchoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversion history not found for this paid school"));
        return ConversionHistoryMapper.toResponse(history, getConvertedByName(history.getConvertedBy()));
    }

    @Override
    public ConversionDetailResponse getConversionDetail(Long id) {
        DemoConversionHistory history = conversionHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversion history not found"));

        DemoRequest demoRequest = demoRequestRepository.findById(history.getDemoRequestId())
                .orElse(null);
        DemoSchool demoSchool = demoSchoolRepository.findById(history.getDemoSchoolId())
                .orElse(null);
        School paidSchool = schoolRepository.findById(history.getPaidSchoolId())
                .orElse(null);

        AdminConversionHistoryResponse conversionResponse = ConversionHistoryMapper.toResponse(
                history, getConvertedByName(history.getConvertedBy())
        );

        Object demoRequestDto = demoRequest != null ? new Object() {
            final Long id = demoRequest.getId();
            final String requestCode = demoRequest.getRequestCode();
            final String schoolName = demoRequest.getSchoolName();
            final String contactPerson = demoRequest.getContactPerson();
            final String email = demoRequest.getEmail();
            final String phone = demoRequest.getPhone();
            final String address = demoRequest.getAddress();
            final Integer studentCount = demoRequest.getStudentCount();
            final String interestedModules = demoRequest.getInterestedModules();
            final String message = demoRequest.getMessage();
            final String status = demoRequest.getStatus();
            final String createdAt = demoRequest.getCreatedAt() != null ? demoRequest.getCreatedAt().toString() : null;
        } : null;

        Object demoSchoolDto = demoSchool != null ? new Object() {
            final Long id = demoSchool.getId();
            final String demoCode = demoSchool.getDemoCode();
            final String username = demoSchool.getUsername();
            final String enabledModules = demoSchool.getEnabledModules();
            final String startDate = demoSchool.getStartDate() != null ? demoSchool.getStartDate().toString() : null;
            final String expiryDate = demoSchool.getExpiryDate() != null ? demoSchool.getExpiryDate().toString() : null;
            final String remarks = demoSchool.getRemarks();
            final String status = demoSchool.getStatus();
            final String createdAt = demoSchool.getCreatedAt() != null ? demoSchool.getCreatedAt().toString() : null;
        } : null;

        Object paidSchoolDto = paidSchool != null ? new Object() {
            final Long id = paidSchool.getId();
            final String code = paidSchool.getCode();
            final String name = paidSchool.getName();
            final String address = paidSchool.getAddress();
            final String phone = paidSchool.getPhone();
            final String email = paidSchool.getEmail();
            final String status = paidSchool.getStatus();
            final Boolean active = paidSchool.isActive();
        } : null;

        return new ConversionDetailResponse(conversionResponse, demoRequestDto, demoSchoolDto, paidSchoolDto);
    }

    private String getConvertedByName(Long userId) {
        if (userId == null) return "Unknown";
        return userRepository.findById(userId)
                .map(user -> user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : user.getUsername())
                .orElse("Unknown");
    }

    private String generateConversionCode() {
        long count = conversionHistoryRepository.count();
        return String.format("CNV-%06d", count + 1);
    }
}
