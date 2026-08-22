package com.pathshala.service;

import com.pathshala.dto.ApiDtos.CreateSchoolRequest;
import com.pathshala.dto.ApiDtos.CreateSchoolResponse;
import com.pathshala.dto.ApiDtos.SchoolLogoResponse;
import com.pathshala.entity.School;
import com.pathshala.entity.DemoRequest;
import com.pathshala.entity.ModuleCode;
import org.springframework.web.multipart.MultipartFile;

public interface SchoolService {
    CreateSchoolResponse createSchool(CreateSchoolRequest request);
    School updateSchool(Long id, CreateSchoolRequest request);
    void deleteSchool(Long id);
    School toggleStatus(Long id, String status);
    SchoolLogoResponse uploadLogo(Long id, MultipartFile file);
    SchoolLogo loadLogo(Long id);
    void removeLogo(Long id);
    DemoProvisioning createDemoFromRequest(DemoRequest request, java.util.List<ModuleCode> modules);
    DemoProvisioning createDemoFromRequest(DemoRequest request, java.util.List<ModuleCode> modules, String username);
    String resetSchoolAdminPassword(Long schoolId);
    String suggestUsername(String email);
    String normalizeUsername(String username);
    boolean usernameAvailable(String username);

    record SchoolLogo(byte[] bytes, String contentType) {}
    record DemoProvisioning(School school, Long userId, String username, String password,
                            java.util.List<ModuleCode> modules, java.time.LocalDate startsOn,
                            java.time.LocalDate endsOn) {}
}
