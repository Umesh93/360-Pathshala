package com.pathshala.service;

import com.pathshala.dto.DemoDtos.*;

import java.util.List;
import java.util.Map;

public interface DemoSchoolService {
    CreateDemoAccountResponse createDemoAccount(CreateDemoAccountRequest request);
    List<AdminDemoSchoolResponse> findAllAdmin();
    AdminDemoSchoolResponse findAdminById(Long id);
    AdminDemoSchoolResponse update(Long id, UpdateDemoSchoolRequest request);
    AdminDemoSchoolResponse extendDemo(Long id, ExtendDemoRequest request);
    String resetPassword(Long id);
    Map<String, Object> convertToPaid(Long id, ConvertToPaidRequest request);
    void softDelete(Long id);
}
