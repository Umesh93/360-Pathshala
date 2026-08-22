package com.pathshala.controller;

import com.pathshala.dto.DemoDtos.*;
import com.pathshala.entity.ModuleCode;
import com.pathshala.service.DemoRequestService;
import com.pathshala.service.DemoSchoolService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/super-admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class DemoController {
    private final DemoRequestService demoRequestService;
    private final DemoSchoolService demoSchoolService;

    @GetMapping("/demo-requests")
    public List<AdminDemoRequestResponse> getDemoRequests() {
        return demoRequestService.findAllAdmin();
    }

    @GetMapping("/demo-requests/{id}")
    public AdminDemoRequestResponse getDemoRequest(@PathVariable Long id) {
        return demoRequestService.findAdminById(id);
    }

    @PutMapping("/demo-requests/{id}")
    public AdminDemoRequestResponse updateDemoRequest(@PathVariable Long id, @Valid @RequestBody UpdateDemoRequestRequest request) {
        return demoRequestService.updateStatus(id, request);
    }

    @DeleteMapping("/demo-requests/{id}")
    public ResponseEntity<Map<String, String>> deleteDemoRequest(@PathVariable Long id) {
        demoRequestService.softDelete(id);
        return ResponseEntity.ok(Map.of("message", "Demo request deleted successfully"));
    }

    @PostMapping("/demo-requests/{id}/approve")
    public AcceptDemoResponse approveDemoRequest(@PathVariable Long id) {
        return demoRequestService.accept(id, null);
    }

    @PostMapping("/demo-requests/{id}/accept")
    public AcceptDemoResponse acceptDemoRequest(@PathVariable Long id,
                                                @RequestBody(required = false) AcceptDemoRequest request) {
        return demoRequestService.accept(id, request);
    }

    @GetMapping("/demo-requests/{id}/username")
    public DemoUsernameResponse username(@PathVariable Long id, @RequestParam(required = false) String candidate) {
        return demoRequestService.username(id, candidate);
    }

    @PostMapping("/demo-requests/{id}/resend-credentials")
    public AcceptDemoResponse resendCredentials(@PathVariable Long id) {
        return demoRequestService.resendCredentials(id);
    }

    @GetMapping(value = "/demo-requests/{id}/logo", produces = {MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_JPEG_VALUE, "image/webp"})
    public ResponseEntity<byte[]> getDemoRequestLogo(@PathVariable Long id) {
        DemoRequestService.DemoLogo logo = demoRequestService.loadLogo(id);
        if (logo == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(logo.contentType())).body(logo.bytes());
    }

    @PostMapping("/demo-requests/{id}/reject")
    public AdminDemoRequestResponse rejectDemoRequest(@PathVariable Long id) {
        return demoRequestService.updateStatus(id, new UpdateDemoRequestRequest("REJECTED", null));
    }

    @PostMapping("/demo-accounts")
    @ResponseStatus(HttpStatus.CREATED)
    public CreateDemoAccountResponse createDemoAccount(@Valid @RequestBody CreateDemoAccountRequest request) {
        throw new IllegalArgumentException("Manual demo creation is disabled; accept a demo request");
    }

    @PostMapping("/demo-requests/{id}/create-account")
    @ResponseStatus(HttpStatus.CREATED)
    public CreateDemoAccountResponse createDemoAccountFromRequest(@PathVariable Long id, @Valid @RequestBody CreateDemoAccountRequest request) {
        AcceptDemoResponse accepted = demoRequestService.accept(id, new AcceptDemoRequest(request.remarks(), request.username()));
        return new CreateDemoAccountResponse(accepted.demoSchoolId(), null, accepted.username(), accepted.password(), accepted.expiresOn().toString());
    }

    @GetMapping("/demo-accounts")
    public List<AdminDemoSchoolResponse> getDemoAccounts() {
        return demoSchoolService.findAllAdmin();
    }

    @GetMapping("/demo-accounts/{id}")
    public AdminDemoSchoolResponse getDemoAccount(@PathVariable Long id) {
        return demoSchoolService.findAdminById(id);
    }

    @PutMapping("/demo-accounts/{id}")
    public AdminDemoSchoolResponse updateDemoAccount(@PathVariable Long id, @Valid @RequestBody UpdateDemoSchoolRequest request) {
        return demoSchoolService.update(id, request);
    }

    @DeleteMapping("/demo-accounts/{id}")
    public ResponseEntity<Map<String, String>> deleteDemoAccount(@PathVariable Long id) {
        demoSchoolService.softDelete(id);
        return ResponseEntity.ok(Map.of("message", "Demo account deleted successfully"));
    }

    @PostMapping("/demo-accounts/{id}/extend")
    public AdminDemoSchoolResponse extendDemo(@PathVariable Long id, @Valid @RequestBody ExtendDemoRequest request) {
        return demoSchoolService.extendDemo(id, request);
    }

    @PostMapping("/demo-accounts/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable Long id) {
        String newPassword = demoSchoolService.resetPassword(id);
        return ResponseEntity.ok(Map.of("password", newPassword));
    }

    @PostMapping("/demo-accounts/{id}/convert")
    public ResponseEntity<Map<String, Object>> convertToPaid(@PathVariable Long id, @Valid @RequestBody ConvertToPaidRequest request) {
        Map<String, Object> result = demoSchoolService.convertToPaid(id, request);
        return ResponseEntity.ok(result);
    }
}
