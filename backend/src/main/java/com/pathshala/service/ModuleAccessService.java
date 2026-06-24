package com.pathshala.service;

import com.pathshala.entity.ModuleCode;

public interface ModuleAccessService {
    void require(Long schoolId, ModuleCode moduleCode);
}
