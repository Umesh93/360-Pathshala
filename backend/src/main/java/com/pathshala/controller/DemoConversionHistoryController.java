package com.pathshala.controller;

import com.pathshala.dto.DemoDtos.AdminConversionHistoryResponse;
import com.pathshala.dto.DemoDtos.ConversionDetailResponse;
import com.pathshala.service.DemoConversionHistoryService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/super-admin/demo-conversions")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class DemoConversionHistoryController {
    private final DemoConversionHistoryService conversionHistoryService;

    public DemoConversionHistoryController(DemoConversionHistoryService conversionHistoryService) {
        this.conversionHistoryService = conversionHistoryService;
    }

    @GetMapping
    public List<AdminConversionHistoryResponse> getAllConversions() {
        return conversionHistoryService.findAll();
    }

    @GetMapping("/{id}")
    public AdminConversionHistoryResponse getConversionById(@PathVariable Long id) {
        return conversionHistoryService.getConversionDetail(id).conversion();
    }

    @GetMapping("/code/{conversionCode}")
    public AdminConversionHistoryResponse getConversionByCode(@PathVariable String conversionCode) {
        return conversionHistoryService.findByConversionCode(conversionCode);
    }

    @GetMapping("/demo/{demoSchoolId}")
    public AdminConversionHistoryResponse getConversionByDemoSchool(@PathVariable Long demoSchoolId) {
        return conversionHistoryService.findByDemoSchoolId(demoSchoolId);
    }

    @GetMapping("/school/{paidSchoolId}")
    public AdminConversionHistoryResponse getConversionByPaidSchool(@PathVariable Long paidSchoolId) {
        return conversionHistoryService.findByPaidSchoolId(paidSchoolId);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long total = conversionHistoryService.findAll().size();
        Map<String, Object> stats = Map.of(
                "totalConversions", total,
                "conversionsThisMonth", total,
                "conversionRate", total > 0 ? "100" : "0"
        );
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCSV() {
        String csv = "Conversion Code,School Name,Demo Code,Paid School Code,Converted By,Conversion Date,Amount\n";
        for (AdminConversionHistoryResponse conversion : conversionHistoryService.findAll()) {
            csv += String.format("%s,%s,%s,%s,%s,%s,%s\n",
                    conversion.conversionCode(),
                    conversion.schoolName(),
                    "DS-" + String.valueOf(conversion.demoSchoolId()),
                    "SCH-" + String.valueOf(conversion.paidSchoolId()),
                    conversion.convertedByName(),
                    conversion.conversionDate(),
                    conversion.paymentAmount() != null ? conversion.paymentAmount() : "0"
            );
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=conversion-history.csv")
                .body(csv.getBytes());
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() {
        String csv = "Conversion Code,School Name,Demo Code,Paid School Code,Converted By,Conversion Date,Amount\n";
        for (AdminConversionHistoryResponse conversion : conversionHistoryService.findAll()) {
            csv += String.format("%s,%s,%s,%s,%s,%s,%s\n",
                    conversion.conversionCode(),
                    conversion.schoolName(),
                    "DS-" + String.valueOf(conversion.demoSchoolId()),
                    "SCH-" + String.valueOf(conversion.paidSchoolId()),
                    conversion.convertedByName(),
                    conversion.conversionDate(),
                    conversion.paymentAmount() != null ? conversion.paymentAmount() : "0"
            );
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=conversion-history.xlsx")
                .body(csv.getBytes());
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPDF() {
        String content = "360 Pathshala - Conversion History Report\n\n";
        for (AdminConversionHistoryResponse conversion : conversionHistoryService.findAll()) {
            content += String.format("%s | %s | %s | %s\n",
                    conversion.conversionCode(),
                    conversion.schoolName(),
                    conversion.conversionDate(),
                    conversion.paymentAmount() != null ? "NPR " + conversion.paymentAmount() : "NPR 0"
            );
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=conversion-history.pdf")
                .body(content.getBytes());
    }
}
