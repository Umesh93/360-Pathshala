package com.pathshala.service;

import com.pathshala.dto.DemoDtos.*;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface DemoRequestService {
    PublicDemoRequestResponse createPublicRequest(PublicDemoRequestRequest request);
    PublicDemoRequestResponse createPublicRequest(PublicDemoRequestRequest request, MultipartFile logo);
    List<AdminDemoRequestResponse> findAllAdmin();
    AdminDemoRequestResponse findAdminById(Long id);
    AdminDemoRequestResponse updateStatus(Long id, UpdateDemoRequestRequest request);
    void softDelete(Long id);
    AcceptDemoResponse accept(Long id, AcceptDemoRequest request);
    DemoUsernameResponse username(Long id, String candidate);
    AcceptDemoResponse resendCredentials(Long id);
    DemoLogo loadLogo(Long id);

    record DemoLogo(byte[] bytes, String contentType) {}
}
