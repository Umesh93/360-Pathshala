package com.pathshala.controller;

import com.pathshala.entity.TenantEntity;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.repository.TenantRepository;
import com.pathshala.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

abstract class CrudController<T extends TenantEntity> {
    private final TenantRepository<T> repository;
    private final SecurityUtils securityUtils;

    protected CrudController(TenantRepository<T> repository, SecurityUtils securityUtils) {
        this.repository = repository;
        this.securityUtils = securityUtils;
    }

    protected Page<T> list(Pageable pageable) {
        return repository.findBySchoolIdAndDeletedFalse(securityUtils.requiredSchoolId(), pageable);
    }

    protected T get(Long id) {
        Long schoolId = securityUtils.requiredSchoolId();
        return repository.findByIdAndSchoolIdAndDeletedFalse(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    protected T save(T entity) {
        entity.setSchoolId(securityUtils.schoolScope(entity.getSchoolId()));
        return repository.save(entity);
    }

    protected void softDelete(Long id) {
        T entity = get(id);
        entity.setDeleted(true);
        repository.save(entity);
    }
}
