package com.pathshala.controller;

import com.pathshala.dto.DemoDtos.PublicDemoRequestRequest;
import com.pathshala.dto.DemoDtos.PublicDemoRequestResponse;
import com.pathshala.entity.PlatformModule;
import com.pathshala.repository.Repositories.ModuleRepository;
import com.pathshala.service.DemoRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@Slf4j
public class PublicController {
    private final DemoRequestService demoRequestService;
    private final ModuleRepository moduleRepository;

    @PostMapping(value = "/demo-request", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PublicDemoRequestResponse submitDemoRequest(@Valid @RequestBody PublicDemoRequestRequest request) {
        log.info("Received public demo request: school={}, email={}", request.schoolName(), request.email());
        return demoRequestService.createPublicRequest(request);
    }

    @PostMapping(value = "/demo-request", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PublicDemoRequestResponse submitDemoRequest(
            @Valid @RequestPart("request") PublicDemoRequestRequest request,
            @RequestPart(value = "logo", required = false) MultipartFile logo,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        if (logo != null && file != null) throw new IllegalArgumentException("Provide either logo or file, not both");
        return demoRequestService.createPublicRequest(request, logo != null ? logo : file);
    }

    @GetMapping("/modules")
    public List<PlatformModule> listModules() {
        return moduleRepository.findAll().stream()
                .filter(PlatformModule::isActive)
                .filter(PlatformModule::isSelectable)
                .toList();
    }
}
