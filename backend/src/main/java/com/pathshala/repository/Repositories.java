package com.pathshala.repository;

import com.pathshala.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface Repositories {
    interface SchoolRepository extends JpaRepository<School, Long> {}
    interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {}
    interface ModuleRepository extends JpaRepository<PlatformModule, Long> {
        Optional<PlatformModule> findByCode(ModuleCode code);
    }
    interface SchoolModuleRepository extends JpaRepository<SchoolModule, Long> {
        Optional<SchoolModule> findBySchoolIdAndModuleCodeAndDeletedFalse(Long schoolId, ModuleCode moduleCode);
        boolean existsBySchoolIdAndModuleCodeAndActiveTrueAndDeletedFalse(Long schoolId, ModuleCode moduleCode);
    }
    interface UserRepository extends JpaRepository<User, Long> {
        Optional<User> findByUsernameOrEmailAndDeletedFalse(String username, String email);
        Optional<User> findByUsernameAndDeletedFalse(String username);
        boolean existsByUsernameOrEmail(String username, String email);
    }
    interface StudentRepository extends TenantRepository<Student> {
        Page<Student> findBySchoolIdAndDeletedFalseAndFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(Long schoolId, String firstName, String lastName, Pageable pageable);
    }
    interface TeacherRepository extends TenantRepository<Teacher> {}
    interface ParentRepository extends TenantRepository<Parent> {}
    interface AcademicYearRepository extends TenantRepository<AcademicYear> {}
    interface SchoolClassRepository extends TenantRepository<SchoolClass> {}
    interface SectionRepository extends TenantRepository<Section> {}
    interface SubjectRepository extends TenantRepository<Subject> {}
    interface TeacherSubjectRepository extends TenantRepository<TeacherSubject> {}
    interface AttendanceRepository extends TenantRepository<Attendance> {
        List<Attendance> findBySchoolIdAndStudentIdAndAttendanceDateBetweenAndDeletedFalse(Long schoolId, Long studentId, LocalDate start, LocalDate end);
        long countBySchoolIdAndStatusAndDeletedFalse(Long schoolId, AttendanceStatus status);
    }
    interface ExamTypeRepository extends TenantRepository<ExamType> {}
    interface ExamRepository extends TenantRepository<Exam> {}
    interface ExamSubjectRepository extends TenantRepository<ExamSubject> {}
    interface MarkRepository extends TenantRepository<Mark> {}
    interface AssignmentRepository extends TenantRepository<Assignment> {}
    interface AssignmentSubmissionRepository extends TenantRepository<AssignmentSubmission> {}
    interface FeeCategoryRepository extends TenantRepository<FeeCategory> {}
    interface FeeStructureRepository extends TenantRepository<FeeStructure> {
        @Query("select coalesce(sum(f.amount),0) from FeeStructure f where f.schoolId = :schoolId and f.deleted = false")
        BigDecimal totalExpected(Long schoolId);
    }
    interface FeeCollectionRepository extends TenantRepository<FeeCollection> {
        @Query("select coalesce(sum(f.paidAmount),0) from FeeCollection f where f.schoolId = :schoolId and f.deleted = false")
        BigDecimal totalCollected(Long schoolId);
    }
    interface LeaveRequestRepository extends TenantRepository<LeaveRequest> {}
    interface NotificationRepository extends TenantRepository<Notification> {}
    interface AuditLogRepository extends JpaRepository<AuditLog, Long> {}
    interface DataAccessLogRepository extends JpaRepository<DataAccessLog, Long> {}
}
