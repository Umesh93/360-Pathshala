package com.pathshala.repository;

import com.pathshala.entity.TenantEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.Optional;

@NoRepositoryBean
public interface TenantRepository<T extends TenantEntity> extends JpaRepository<T, Long> {
    Page<T> findBySchoolIdAndDeletedFalse(Long schoolId, Pageable pageable);
    Optional<T> findByIdAndSchoolIdAndDeletedFalse(Long id, Long schoolId);
    long countBySchoolIdAndDeletedFalse(Long schoolId);
}
