package com.pathshala.repository;

import com.pathshala.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.Collection;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

public interface Repositories {
    interface SchoolRepository extends JpaRepository<School, Long> {
        boolean existsByCode(String code);
        boolean existsByEmail(String email);
        Optional<School> findByIdAndDeletedFalse(Long id);
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select s from School s where s.id = :id and s.deleted = false")
        Optional<School> lockByIdAndDeletedFalse(Long id);
    }
    interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
        boolean existsBySchoolId(Long schoolId);
        Optional<Subscription> findFirstBySchoolIdOrderByIdDesc(Long schoolId);
        List<Subscription> findBySubscriptionStatusIgnoreCaseAndEndsOnBefore(String status, LocalDate date);
        List<Subscription> findBySchoolIdOrderByIdDesc(Long schoolId);
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        Optional<Subscription> findTopBySchoolIdAndSubscriptionStatusInOrderByEndsOnDesc(Long schoolId, Collection<String> statuses);
        List<Subscription> findBySubscriptionStatusAndStartsOnLessThanEqual(String status, LocalDate date);
        List<Subscription> findAllByOrderByCreatedAtDesc();
        Optional<Subscription> findTopBySchoolIdAndSubscriptionStatusOrderByStartsOnDesc(Long schoolId, String status);
    }
    interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
        boolean existsByName(String name);
        Optional<SubscriptionPlan> findByCode(String code);
        List<SubscriptionPlan> findByActiveTrueOrderByIdAsc();
    }
    interface SubscriptionPlanModuleRepository extends JpaRepository<SubscriptionPlanModule, Long> {
        List<SubscriptionPlanModule> findByPlanId(Long planId);
        void deleteByPlanId(Long planId);
    }
    interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
        Optional<PaymentTransaction> findByPidx(String pidx);
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        Optional<PaymentTransaction> findWithLockByPidx(String pidx);
        Optional<PaymentTransaction> findByPurchaseOrderId(String purchaseOrderId);
        List<PaymentTransaction> findBySchoolIdOrderByCreatedAtDesc(Long schoolId);
        List<PaymentTransaction> findBySchoolIdAndStatusOrderByCreatedAtDesc(Long schoolId, PaymentTransaction.Status status);
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        Optional<PaymentTransaction> findWithLockById(Long id);
        Optional<PaymentTransaction> findFirstBySchoolIdAndPlanIdAndStatusAndCreatedAtAfterOrderByIdDesc(Long schoolId, Long planId, PaymentTransaction.Status status, java.time.Instant after);
        Optional<PaymentTransaction> findFirstBySchoolIdAndPlanIdAndStatusInAndCreatedAtAfterOrderByIdDesc(Long schoolId, Long planId, Collection<PaymentTransaction.Status> statuses, java.time.Instant after);
        List<PaymentTransaction> findBySchoolIdAndStatusInAndCreatedAtAfterOrderByIdDesc(Long schoolId, Collection<PaymentTransaction.Status> statuses, java.time.Instant after);
        List<PaymentTransaction> findAllByOrderByCreatedAtDesc();
    }
    interface ModuleRepository extends JpaRepository<PlatformModule, Long> {
        Optional<PlatformModule> findByCode(ModuleCode code);
        boolean existsByCode(ModuleCode code);
    }
    interface SchoolModuleRepository extends JpaRepository<SchoolModule, Long> {
        Optional<SchoolModule> findBySchoolIdAndModuleCodeAndDeletedFalse(Long schoolId, ModuleCode moduleCode);
        boolean existsBySchoolIdAndModuleCodeAndActiveTrueAndDeletedFalse(Long schoolId, ModuleCode moduleCode);
        List<SchoolModule> findBySchoolIdAndDeletedFalse(Long schoolId);
        List<SchoolModule> findBySchoolIdAndActiveTrueAndDeletedFalse(Long schoolId);
    }
    interface UserRepository extends JpaRepository<User, Long> {
        Optional<User> findByIdAndDeletedFalse(Long id);
        Optional<User> findByUsernameOrEmailAndDeletedFalse(String username, String email);
        Optional<User> findByEmailIgnoreCaseAndDeletedFalse(String email);
        Optional<User> findByUsernameAndDeletedFalse(String username);
        Optional<User> findByUsername(String username);
        boolean existsByUsernameOrEmail(String username, String email);
        boolean existsByUsernameAndDeletedFalse(String username);
        boolean existsByUsername(String username);
        List<User> findBySchoolIdAndDeletedFalse(Long schoolId);
    }
    interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select token from PasswordResetToken token where token.tokenHash = :tokenHash")
        Optional<PasswordResetToken> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);
        void deleteByUserId(Long userId);
    }
    interface StudentRepository extends TenantRepository<Student> {
        Page<Student> findBySchoolIdAndDeletedFalseAndFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(Long schoolId, String firstName, String lastName, Pageable pageable);
        boolean existsBySchoolIdAndAdmissionNumberIgnoreCaseAndDeletedFalse(Long schoolId, String admissionNumber);
        boolean existsBySchoolIdAndAdmissionNumberIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, String admissionNumber, Long id);
        boolean existsBySchoolIdAndClassIdAndSectionIdAndRollNumberIgnoreCaseAndDeletedFalse(Long schoolId, Long classId, Long sectionId, String rollNumber);
        boolean existsBySchoolIdAndClassIdAndSectionIdAndRollNumberIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, Long classId, Long sectionId, String rollNumber, Long id);
        boolean existsBySchoolIdAndStudentEmailIgnoreCaseAndDeletedFalse(Long schoolId, String studentEmail);
        boolean existsBySchoolIdAndStudentEmailIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, String studentEmail, Long id);
        boolean existsBySchoolIdAndStudentPhoneAndDeletedFalse(Long schoolId, String studentPhone);
        boolean existsBySchoolIdAndStudentPhoneAndIdNotAndDeletedFalse(Long schoolId, String studentPhone, Long id);
        boolean existsBySchoolIdAndClassIdAndDeletedFalse(Long schoolId, Long classId);
        boolean existsBySchoolIdAndSectionIdAndDeletedFalse(Long schoolId, Long sectionId);
        List<Student> findBySchoolIdAndParentIdAndDeletedFalse(Long schoolId, Long parentId);
        List<Student> findBySchoolIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(Long schoolId, String status);
        List<Student> findBySchoolIdAndClassIdAndSectionIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(Long schoolId, Long classId, Long sectionId, String status);
        Optional<Student> findBySchoolIdAndUserIdAndDeletedFalse(Long schoolId, Long userId);
        long countBySchoolIdAndParentIdAndDeletedFalse(Long schoolId, Long parentId);
        long countBySchoolIdAndParentId(Long schoolId, Long parentId);
        long countBySchoolIdAndDeletedFalse(Long schoolId);
        long countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(Long schoolId, String status);
        List<Student> findBySchoolIdAndIdInAndDeletedFalse(Long schoolId, Collection<Long> ids);
        @Query(value = "select coalesce(max(cast(s.roll_number as unsigned)), 0) from students s where s.school_id = ?1 and s.class_id = ?2 and s.section_id = ?3 and s.is_deleted = false and s.roll_number regexp '^[0-9]+$'", nativeQuery = true)
        long findMaxActiveNumericRollNumber(Long schoolId, Long classId, Long sectionId);
        @Query(value = "select coalesce(max(cast(substring_index(s.admission_number, '-', -1) as unsigned)), 0) from students s where s.school_id = ?1 and s.admission_number regexp '^[A-Z]+-[0-9]{3}-[0-9]+$'", nativeQuery = true)
        long findMaxAdmissionSequence(Long schoolId);
    }
    interface TeacherRepository extends TenantRepository<Teacher> {
        Page<Teacher> findBySchoolIdAndDeletedFalseAndFirstNameContainingIgnoreCaseOrSchoolIdAndDeletedFalseAndLastNameContainingIgnoreCaseOrSchoolIdAndDeletedFalseAndEmployeeNumberContainingIgnoreCase(Long schoolId, String firstName, Long lastNameSchoolId, String lastName, Long employeeSchoolId, String employeeNumber, Pageable pageable);
        Page<Teacher> findBySchoolIdAndDeletedFalseAndStatusIgnoreCase(Long schoolId, String status, Pageable pageable);
        boolean existsBySchoolIdAndEmployeeNumberIgnoreCaseAndDeletedFalse(Long schoolId, String employeeNumber);
        boolean existsBySchoolIdAndEmployeeNumberIgnoreCase(Long schoolId, String employeeNumber);
        boolean existsBySchoolIdAndEmployeeNumberIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, String employeeNumber, Long id);
        boolean existsBySchoolIdAndEmailIgnoreCaseAndDeletedFalse(Long schoolId, String email);
        boolean existsBySchoolIdAndEmailIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, String email, Long id);
        long countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(Long schoolId, String status);
        long countBySchoolIdAndDeletedFalse(Long schoolId);
        List<Teacher> findBySchoolIdAndIdInAndDeletedFalse(Long schoolId, Collection<Long> ids);
        Optional<Teacher> findBySchoolIdAndUserIdAndStatusIgnoreCaseAndDeletedFalse(Long schoolId, Long userId, String status);
        @Query(value = "select coalesce(max(cast(substring(t.employee_number, 5) as unsigned)), 0) from teachers t where t.school_id = ?1 and t.employee_number regexp '^TCH-[0-9]+$'", nativeQuery = true)
        long findMaxTeacherIdSequence(Long schoolId);
        @Query(value = "select coalesce(max(cast(substring(json_unquote(json_extract(t.details, '$.employeeCode')), 5) as unsigned)), 0) from teachers t where t.school_id = ?1 and json_unquote(json_extract(t.details, '$.employeeCode')) regexp '^EMP-[0-9]+$'", nativeQuery = true)
        long findMaxEmployeeCodeSequence(Long schoolId);
        @Query(value = "select count(*) from teachers t where t.school_id = ?1 and json_unquote(json_extract(t.details, '$.employeeCode')) = ?2", nativeQuery = true)
        long countBySchoolIdAndEmployeeCode(Long schoolId, String employeeCode);
        @Query(value = "select count(*) from teachers t where t.school_id = ?1 and t.id <> ?2 and json_unquote(json_extract(t.details, '$.employeeCode')) = ?3", nativeQuery = true)
        long countBySchoolIdAndIdNotAndEmployeeCode(Long schoolId, Long id, String employeeCode);
    }
    interface ParentRepository extends TenantRepository<Parent>, JpaSpecificationExecutor<Parent> {
        Optional<Parent> findBySchoolIdAndUserIdAndDeletedFalse(Long schoolId, Long userId);
        Page<Parent> findBySchoolIdAndDeletedFalseAndFullNameContainingIgnoreCaseOrSchoolIdAndDeletedFalseAndPhoneContainingIgnoreCaseOrSchoolIdAndDeletedFalseAndEmailContainingIgnoreCase(Long schoolId, String fullName, Long phoneSchoolId, String phone, Long emailSchoolId, String email, Pageable pageable);
        boolean existsBySchoolIdAndPhoneAndDeletedFalse(Long schoolId, String phone);
        boolean existsBySchoolIdAndEmailIgnoreCaseAndDeletedFalse(Long schoolId, String email);
        boolean existsBySchoolIdAndPhoneAndIdNotAndDeletedFalse(Long schoolId, String phone, Long id);
        boolean existsBySchoolIdAndEmailIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, String email, Long id);
        boolean existsBySchoolIdAndCitizenshipNumberIgnoreCaseAndDeletedFalse(Long schoolId, String citizenshipNumber);
        boolean existsBySchoolIdAndCitizenshipNumberIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, String citizenshipNumber, Long id);
        boolean existsBySchoolIdAndGuardianCodeIgnoreCase(Long schoolId, String guardianCode);
        long countBySchoolIdAndDeletedFalse(Long schoolId);
        long countBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(Long schoolId, String status);
        Page<Parent> findBySchoolIdAndStatusIgnoreCaseAndDeletedFalse(Long schoolId, String status, Pageable pageable);
        Page<Parent> findBySchoolIdAndDeletedTrue(Long schoolId, Pageable pageable);
        java.util.Optional<Parent> findByIdAndSchoolId(Long id, Long schoolId);
        @Query(value = "select coalesce(max(cast(substring(p.guardian_code, 5) as unsigned)), 0) from parents p where p.school_id = ?1 and p.guardian_code regexp '^GDN-[0-9]+$'", nativeQuery = true)
        long findMaxGuardianCodeSequence(Long schoolId);
    }
    interface AcademicYearRepository extends TenantRepository<AcademicYear> {
        Optional<AcademicYear> findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(Long schoolId);
        List<AcademicYear> findBySchoolIdAndDeletedFalseOrderByStartsOnDesc(Long schoolId);
        Optional<AcademicYear> findBySchoolIdAndIdAndDeletedFalse(Long schoolId, Long id);
    }
    interface SchoolClassRepository extends TenantRepository<SchoolClass> {
        Page<SchoolClass> findBySchoolIdAndNameContainingIgnoreCaseOrSchoolIdAndCodeContainingIgnoreCaseAndDeletedFalse(Long schoolId, String name, Long codeSchoolId, String code, Pageable pageable);
        boolean existsBySchoolIdAndNameIgnoreCaseAndDeletedFalse(Long schoolId, String name);
        boolean existsBySchoolIdAndCodeIgnoreCaseAndDeletedFalse(Long schoolId, String code);
        long countBySchoolIdAndDeletedFalse(Long schoolId);
        List<SchoolClass> findBySchoolIdAndIdInAndDeletedFalse(Long schoolId, Collection<Long> ids);
        boolean existsBySchoolIdAndNameIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, String name, Long id);
        boolean existsBySchoolIdAndCodeIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, String code, Long id);
    }
    interface SectionRepository extends TenantRepository<Section> {
        Page<Section> findBySchoolIdAndClassIdAndDeletedFalse(Long schoolId, Long classId, Pageable pageable);
        boolean existsBySchoolIdAndClassIdAndNameIgnoreCaseAndDeletedFalse(Long schoolId, Long classId, String name);
        boolean existsBySchoolIdAndClassIdAndNameIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, Long classId, String name, Long id);
        boolean existsBySchoolIdAndClassIdAndDeletedFalse(Long schoolId, Long classId);
        long countBySchoolIdAndDeletedFalse(Long schoolId);
        List<Section> findBySchoolIdAndIdInAndDeletedFalse(Long schoolId, Collection<Long> ids);
    }
    interface SubjectRepository extends TenantRepository<Subject>, JpaSpecificationExecutor<Subject> {
        Page<Subject> findBySchoolIdAndClassIdAndDeletedFalse(Long schoolId, Long classId, Pageable pageable);
        Page<Subject> findBySchoolIdAndDeletedFalseAndSubjectNameContainingIgnoreCaseOrSchoolIdAndDeletedFalseAndSubjectCodeContainingIgnoreCase(Long schoolId, String name, Long codeSchoolId, String code, Pageable pageable);
        Page<Subject> findBySchoolIdAndDeletedTrue(Long schoolId, Pageable pageable);
        java.util.Optional<Subject> findByIdAndSchoolId(Long id, Long schoolId);
        boolean existsBySchoolIdAndSubjectCodeIgnoreCaseAndDeletedFalse(Long schoolId, String code);
        boolean existsBySchoolIdAndSubjectCodeIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, String code, Long id);
        boolean existsBySchoolIdAndClassIdAndSubjectNameIgnoreCaseAndDeletedFalse(Long schoolId, Long classId, String name);
        boolean existsBySchoolIdAndClassIdAndSubjectNameIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, Long classId, String name, Long id);
        List<Subject> findBySchoolIdAndIdInAndDeletedFalse(Long schoolId, Collection<Long> ids);
    }
    interface SubjectAcademicConfigRepository extends TenantRepository<SubjectAcademicConfig> {
        List<SubjectAcademicConfig> findBySchoolIdAndAcademicSessionIdAndClassIdAndDeletedFalse(Long schoolId, Long sessionId, Long classId);
        Optional<SubjectAcademicConfig> findBySchoolIdAndAcademicSessionIdAndClassIdAndSubjectId(Long schoolId, Long sessionId, Long classId, Long subjectId);
    }
    interface TeacherSubjectRepository extends TenantRepository<TeacherSubject> {
        List<TeacherSubject> findBySchoolIdAndTeacherIdAndDeletedFalse(Long schoolId, Long teacherId);
        List<TeacherSubject> findBySchoolIdAndAcademicSessionIdAndTeacherIdAndDeletedFalse(Long schoolId, Long academicSessionId, Long teacherId);
        List<TeacherSubject> findBySchoolIdAndSubjectIdAndDeletedFalse(Long schoolId, Long subjectId);
        List<TeacherSubject> findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionId(Long schoolId, Long academicSessionId, Long classId, Long sectionId);
        List<TeacherSubject> findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndDeletedFalse(Long schoolId, Long academicSessionId, Long classId, Long sectionId);
        java.util.Optional<TeacherSubject> findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndSubjectId(Long schoolId, Long academicSessionId, Long classId, Long sectionId, Long subjectId);
        java.util.Optional<TeacherSubject> findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndSubjectIdAndTeacherIdAndDeletedFalse(Long schoolId, Long academicSessionId, Long classId, Long sectionId, Long subjectId, Long teacherId);
        long countBySchoolIdAndSubjectIdAndDeletedFalse(Long schoolId, Long subjectId);
    }
    interface TimetablePeriodRepository extends TenantRepository<TimetablePeriod> {
        List<TimetablePeriod> findBySchoolIdAndAcademicSessionIdAndDeletedFalseOrderByStartTimeAsc(Long schoolId, Long sessionId);
        boolean existsBySchoolIdAndAcademicSessionIdAndPeriodNumberAndDeletedFalse(Long schoolId, Long sessionId, Integer periodNumber);
        boolean existsBySchoolIdAndAcademicSessionIdAndPeriodNumberAndIdNotAndDeletedFalse(Long schoolId, Long sessionId, Integer periodNumber, Long id);
        boolean existsBySchoolIdAndAcademicSessionIdAndNameIgnoreCaseAndStartTimeAndEndTimeAndDeletedFalse(Long schoolId, Long sessionId, String name, java.time.LocalTime startTime, java.time.LocalTime endTime);
        boolean existsBySchoolIdAndAcademicSessionIdAndNameIgnoreCaseAndStartTimeAndEndTimeAndIdNotAndDeletedFalse(Long schoolId, Long sessionId, String name, java.time.LocalTime startTime, java.time.LocalTime endTime, Long id);
    }
    interface TimetableWorkingDayRepository extends TenantRepository<TimetableWorkingDay> {
        List<TimetableWorkingDay> findBySchoolIdAndAcademicSessionIdAndDeletedFalseOrderByDayOfWeekAsc(Long schoolId, Long sessionId);
        Optional<TimetableWorkingDay> findBySchoolIdAndAcademicSessionIdAndDayOfWeek(Long schoolId, Long sessionId, DayOfWeek dayOfWeek);
    }
    interface TimetableRepository extends TenantRepository<Timetable> {
        List<Timetable> findBySchoolIdAndAcademicSessionIdAndDeletedFalse(Long schoolId, Long sessionId);
        List<Timetable> findBySchoolIdAndAcademicSessionIdAndStatusNotAndDeletedFalse(Long schoolId, Long sessionId, Timetable.Status status);
        Optional<Timetable> findFirstBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndStatusNotAndDeletedFalseOrderByUpdatedAtDesc(Long schoolId, Long sessionId, Long classId, Long sectionId, Timetable.Status status);
        List<Timetable> findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndStatusNotAndDeletedFalse(Long schoolId, Long sessionId, Long classId, Long sectionId, Timetable.Status status);
    }
    interface TimetableEntryRepository extends TenantRepository<TimetableEntry> {
        List<TimetableEntry> findBySchoolIdAndTimetableIdAndDeletedFalse(Long schoolId, Long timetableId);
        List<TimetableEntry> findBySchoolIdAndTimetableIdInAndDeletedFalse(Long schoolId, List<Long> timetableIds);
        boolean existsBySchoolIdAndPeriodIdAndDeletedFalse(Long schoolId, Long periodId);
    }
    interface ProvinceRepository extends JpaRepository<Province, Long> {
        List<Province> findAllByDeletedFalse();
        Optional<Province> findFirstByNameIgnoreCaseAndDeletedFalse(String name);
    }
    interface DistrictRepository extends JpaRepository<District, Long> {
        List<District> findAllByDeletedFalse();
        List<District> findByProvinceIdAndDeletedFalse(Long provinceId);
        Optional<District> findFirstByProvinceIdAndNameIgnoreCaseAndDeletedFalse(Long provinceId, String name);
    }
    interface MunicipalityRepository extends JpaRepository<Municipality, Long> {
        List<Municipality> findAllByDeletedFalse();
        List<Municipality> findByDistrictIdAndDeletedFalse(Long districtId);
        Optional<Municipality> findFirstByDistrictIdAndNameIgnoreCaseAndDeletedFalse(Long districtId, String name);
    }
    interface WardRepository extends JpaRepository<Ward, Long> {
        List<Ward> findAllByDeletedFalse();
        List<Ward> findByMunicipalityIdAndDeletedFalse(Long municipalityId);
        Optional<Ward> findFirstByMunicipalityIdAndNumberAndDeletedFalse(Long municipalityId, Integer number);
    }
    interface AttendanceRepository extends TenantRepository<Attendance> {
        List<Attendance> findBySchoolIdAndStudentIdAndAttendanceDateBetweenAndDeletedFalse(Long schoolId, Long studentId, LocalDate start, LocalDate end);
        List<Attendance> findBySchoolIdAndAttendanceDateAndDeletedFalse(Long schoolId, LocalDate date);
        List<Attendance> findBySchoolIdAndAttendanceDateBetweenAndDeletedFalse(Long schoolId, LocalDate start, LocalDate end);
        Optional<Attendance> findBySchoolIdAndStudentIdAndAttendanceDateAndDeletedFalse(Long schoolId, Long studentId, LocalDate date);
        long countBySchoolIdAndStatusAndDeletedFalse(Long schoolId, AttendanceStatus status);
        long countBySchoolIdAndAttendanceDateAndStatusAndDeletedFalse(Long schoolId, LocalDate date, AttendanceStatus status);
        long countBySchoolIdAndAttendanceDateBetweenAndStatusAndDeletedFalse(Long schoolId, LocalDate start, LocalDate end, AttendanceStatus status);
        @Query("select a.status, count(a) from Attendance a where a.schoolId = :schoolId and a.attendanceDate between :start and :end and a.deleted = false group by a.status")
        List<Object[]> statusSummary(Long schoolId, LocalDate start, LocalDate end);
        @Query("select a.status, count(a) from Attendance a where a.schoolId = :schoolId and a.academicSessionId = :sessionId and a.attendanceDate = :date and a.deleted = false group by a.status")
        List<Object[]> dashboardStatusSummary(Long schoolId, Long sessionId, LocalDate date);
        @Query("select a from Attendance a where a.schoolId = :schoolId and a.academicSessionId = :sessionId and a.attendanceDate = :date and a.status = com.pathshala.entity.AttendanceStatus.ABSENT and a.deleted = false order by a.id")
        List<Attendance> dashboardAbsences(Long schoolId, Long sessionId, LocalDate date, Pageable pageable);
    }
    interface TeacherAttendanceRepository extends TenantRepository<TeacherAttendance> {
        Optional<TeacherAttendance> findBySchoolIdAndTeacherIdAndAttendanceDateAndDeletedFalse(Long schoolId, Long teacherId, LocalDate date);
        List<TeacherAttendance> findBySchoolIdAndAttendanceDateBetweenAndDeletedFalse(Long schoolId, LocalDate start, LocalDate end);
        List<TeacherAttendance> findBySchoolIdAndAttendanceDateAndDeletedFalse(Long schoolId, LocalDate date);
        @Query("select t.status, count(t) from TeacherAttendance t where t.schoolId = :schoolId and t.attendanceDate = :date and t.deleted = false group by t.status")
        List<Object[]> dashboardStatusSummary(Long schoolId, LocalDate date);
    }
    interface AttendanceCorrectionRepository extends TenantRepository<AttendanceCorrection> {
        List<AttendanceCorrection> findBySchoolIdAndDeletedFalseOrderByCreatedAtDesc(Long schoolId);
    }
    interface HolidayRepository extends TenantRepository<Holiday> {
        List<Holiday> findBySchoolIdAndStartsOnLessThanEqualAndEndsOnGreaterThanEqualAndDeletedFalse(Long schoolId, LocalDate date1, LocalDate date2);
        List<Holiday> findBySchoolIdAndDeletedFalseOrderByStartsOnAsc(Long schoolId);
    }
    interface AttendanceSettingsRepository extends TenantRepository<AttendanceSettings> {
        Optional<AttendanceSettings> findBySchoolIdAndDeletedFalse(Long schoolId);
    }
    interface ExamTypeRepository extends TenantRepository<ExamType> {
        Optional<ExamType> findByIdAndSchoolIdAndDeletedFalse(Long id, Long schoolId);
        List<ExamType> findBySchoolIdAndDeletedFalseOrderByNameAsc(Long schoolId);
        boolean existsBySchoolIdAndNameIgnoreCaseAndDeletedFalse(Long schoolId, String name);
        boolean existsBySchoolIdAndNameIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, String name, Long id);
    }
    interface ExamRepository extends TenantRepository<Exam>, JpaSpecificationExecutor<Exam> {
        boolean existsBySchoolIdAndAcademicSessionIdAndNameIgnoreCaseAndDeletedFalse(Long schoolId, Long sessionId, String name);
        boolean existsBySchoolIdAndAcademicSessionIdAndNameIgnoreCaseAndIdNotAndDeletedFalse(Long schoolId, Long sessionId, String name, Long id);
        List<Exam> findBySchoolIdAndAcademicSessionIdAndDeletedFalse(Long schoolId, Long sessionId);
        List<Exam> findBySchoolIdAndPublishedTrueAndDeletedFalseOrderByStartsOnDesc(Long schoolId);
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select e from Exam e where e.id = :examId and e.schoolId = :schoolId and e.deleted = false")
        Optional<Exam> lockBySchoolIdAndId(Long schoolId, Long examId);
    }
    interface ExamClassAssignmentRepository extends TenantRepository<ExamClassAssignment> {
        List<ExamClassAssignment> findBySchoolIdAndExamIdAndDeletedFalse(Long schoolId, Long examId);
        List<ExamClassAssignment> findBySchoolIdAndExamIdAndSectionIdIsNullAndDeletedFalse(Long schoolId, Long examId);
        List<ExamClassAssignment> findBySchoolIdAndExamIdAndSectionIdIsNotNullAndDeletedFalse(Long schoolId, Long examId);
        List<ExamClassAssignment> findBySchoolIdAndExamIdInAndDeletedFalse(Long schoolId, Collection<Long> examIds);
        List<ExamClassAssignment> findBySchoolIdAndClassIdAndDeletedFalse(Long schoolId, Long classId);
        boolean existsBySchoolIdAndExamIdAndClassIdAndDeletedFalse(Long schoolId, Long examId, Long classId);
        boolean existsBySchoolIdAndExamIdAndSectionIdIsNotNullAndPublishedTrueAndDeletedFalse(Long schoolId, Long examId);
        boolean existsBySchoolIdAndExamIdAndClassIdAndSectionIdAndPublishedTrueAndDeletedFalse(Long schoolId, Long examId, Long classId, Long sectionId);
        Optional<ExamClassAssignment> findBySchoolIdAndExamIdAndClassIdAndSectionIdAndDeletedFalse(Long schoolId, Long examId, Long classId, Long sectionId);
        Optional<ExamClassAssignment> findBySchoolIdAndExamIdAndClassIdAndSectionIdIsNullAndDeletedFalse(Long schoolId, Long examId, Long classId);
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select a from ExamClassAssignment a where a.schoolId = :schoolId and a.examId = :examId and a.classId = :classId and a.sectionId = :sectionId and a.deleted = false")
        Optional<ExamClassAssignment> lockConcreteScope(Long schoolId, Long examId, Long classId, Long sectionId);
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select a from ExamClassAssignment a where a.schoolId = :schoolId and a.examId = :examId and a.sectionId is not null and a.deleted = false order by a.classId, a.sectionId, a.id")
        List<ExamClassAssignment> lockConcreteScopes(Long schoolId, Long examId);
    }
    interface ExamSubjectRepository extends TenantRepository<ExamSubject> {
        List<ExamSubject> findBySchoolIdAndExamIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(Long schoolId, Long examId);
        List<ExamSubject> findBySchoolIdAndExamIdAndClassIdAndSectionIdAndDeletedFalse(Long schoolId, Long examId, Long classId, Long sectionId);
        boolean existsBySchoolIdAndExamIdAndClassIdAndSectionIdAndSubjectIdAndDeletedFalse(Long schoolId, Long examId, Long classId, Long sectionId, Long subjectId);
        boolean existsBySchoolIdAndExamIdAndClassIdAndSectionIdAndSubjectIdAndIdNotAndDeletedFalse(Long schoolId, Long examId, Long classId, Long sectionId, Long subjectId, Long id);
        List<ExamSubject> findBySchoolIdAndDeletedFalseOrderByExamDateAscStartTimeAsc(Long schoolId);
        @Query("select case when count(r) > 0 then true else false end from ExamSubject r where r.schoolId = :schoolId and r.gradingSystemIdSnapshot = :systemId and r.deleted = false")
        boolean existsSnapshotForGradingSystem(Long schoolId, Long systemId);
    }
    interface MarkRepository extends TenantRepository<Mark> {
        Optional<Mark> findBySchoolIdAndExamSubjectIdAndStudentIdAndDeletedFalse(Long schoolId, Long examSubjectId, Long studentId);
        List<Mark> findBySchoolIdAndExamSubjectIdInAndDeletedFalse(Long schoolId, List<Long> examSubjectIds);
        List<Mark> findBySchoolIdAndStudentIdAndDeletedFalse(Long schoolId, Long studentId);
    }
    interface GradingSystemRepository extends TenantRepository<GradingSystem> {
        List<GradingSystem> findBySchoolIdAndAcademicSessionIdAndDeletedFalseOrderByCreatedAtDesc(Long schoolId, Long sessionId);
        Optional<GradingSystem> findBySchoolIdAndAcademicSessionIdAndActiveTrueAndDeletedFalse(Long schoolId, Long sessionId);
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select g from GradingSystem g where g.schoolId = :schoolId and g.academicSessionId = :sessionId and g.deleted = false")
        List<GradingSystem> lockSessionSystems(Long schoolId, Long sessionId);
    }
    interface GradeRuleRepository extends TenantRepository<GradeRule> {
        List<GradeRule> findBySchoolIdAndGradingSystemIdAndDeletedFalseOrderByMinPercentageAsc(Long schoolId, Long systemId);
    }
    interface AssignmentRepository extends TenantRepository<Assignment>, JpaSpecificationExecutor<Assignment> {
        List<Assignment> findBySchoolIdAndTeacherIdAndDeletedFalseOrderByDueAtDesc(Long schoolId, Long teacherId);
        List<Assignment> findBySchoolIdAndStatusInAndPublishAtLessThanEqualAndDeletedFalse(Long schoolId, List<Assignment.Status> statuses, LocalDateTime at);
        List<Assignment> findByStatusInAndDueAtBetweenAndReminderSentAtIsNullAndDeletedFalse(List<Assignment.Status> statuses, LocalDateTime from, LocalDateTime to);
        List<Assignment> findByStatusInAndDueAtBeforeAndDeletedFalse(List<Assignment.Status> statuses, LocalDateTime at);
        List<Assignment> findByStatusAndPublishAtLessThanEqualAndDeletedFalse(Assignment.Status status, LocalDateTime at);
        List<Assignment> findBySchoolIdAndAcademicSessionIdAndDeletedFalseOrderByDueAtAsc(Long schoolId, Long sessionId);
    }
    interface AssignmentSubmissionRepository extends TenantRepository<AssignmentSubmission> {
        Optional<AssignmentSubmission> findBySchoolIdAndAssignmentIdAndStudentIdAndDeletedFalse(Long schoolId, Long assignmentId, Long studentId);
        List<AssignmentSubmission> findBySchoolIdAndAssignmentIdAndDeletedFalse(Long schoolId, Long assignmentId);
        List<AssignmentSubmission> findBySchoolIdAndAssignmentIdInAndStudentIdAndDeletedFalse(Long schoolId, List<Long> assignmentIds, Long studentId);
        @Query("select s.assignmentId, count(s) from AssignmentSubmission s where s.schoolId = :schoolId and s.assignmentId in :assignmentIds and s.status = com.pathshala.entity.AssignmentSubmission.Status.PENDING and s.deleted = false group by s.assignmentId")
        List<Object[]> pendingCounts(Long schoolId, Collection<Long> assignmentIds);
    }
    interface AssignmentSectionRepository extends TenantRepository<AssignmentSection> {
        List<AssignmentSection> findBySchoolIdAndAssignmentId(Long schoolId, Long assignmentId);
        List<AssignmentSection> findBySchoolIdAndAssignmentIdAndDeletedFalse(Long schoolId, Long assignmentId);
        List<AssignmentSection> findBySchoolIdAndAssignmentIdInAndDeletedFalse(Long schoolId, List<Long> assignmentIds);
        boolean existsBySchoolIdAndAssignmentIdAndSectionIdAndDeletedFalse(Long schoolId, Long assignmentId, Long sectionId);
    }
    interface FeeCategoryRepository extends TenantRepository<FeeCategory> {}
    interface FeeStructureRepository extends TenantRepository<FeeStructure> {
        @Query("select coalesce(sum(f.amount),0) from FeeStructure f where f.schoolId = :schoolId and f.deleted = false")
        BigDecimal totalExpected(Long schoolId);
        @Query("select coalesce(sum(f.amount),0) from FeeStructure f where f.schoolId = :schoolId and f.classId = :classId and f.deleted = false")
        BigDecimal totalExpectedForClass(Long schoolId, Long classId);
    }
    interface FeeCollectionRepository extends TenantRepository<FeeCollection> {
        @Query("select coalesce(sum(f.paidAmount),0) from FeeCollection f where f.schoolId = :schoolId and f.deleted = false")
        BigDecimal totalCollected(Long schoolId);
        @Query("select coalesce(sum(f.paidAmount),0) from FeeCollection f where f.schoolId = :schoolId and f.studentId = :studentId and f.deleted = false")
        BigDecimal totalCollectedForStudent(Long schoolId, Long studentId);
    }
    interface LeaveRequestRepository extends TenantRepository<LeaveRequest> {
        List<LeaveRequest> findBySchoolIdAndTeacherIdAndDeletedFalse(Long schoolId, Long teacherId);
        long countBySchoolIdAndTeacherIdIsNotNullAndStatusAndDeletedFalse(Long schoolId, LeaveStatus status);
        List<LeaveRequest> findBySchoolIdAndTeacherIdIsNotNullAndStatusAndDeletedFalseOrderByStartsOnAsc(Long schoolId, LeaveStatus status, Pageable pageable);
        long countBySchoolIdAndTeacherIdIsNotNullAndStatusAndEndsOnGreaterThanEqualAndDeletedFalse(Long schoolId, LeaveStatus status, LocalDate date);
        List<LeaveRequest> findBySchoolIdAndTeacherIdIsNotNullAndStatusAndEndsOnGreaterThanEqualAndDeletedFalseOrderByStartsOnAsc(Long schoolId, LeaveStatus status, LocalDate date, Pageable pageable);
    }
    interface NotificationRepository extends TenantRepository<Notification> {
        boolean existsBySchoolIdAndUserIdAndEventTypeAndMetadataAndDeletedFalse(Long schoolId, Long userId, String eventType, String metadata);
        Page<Notification> findBySchoolIdAndUserIdAndDeletedFalse(Long schoolId, Long userId, Pageable pageable);
    }
    interface AuditLogRepository extends JpaRepository<AuditLog, Long> {}
    interface DataAccessLogRepository extends JpaRepository<DataAccessLog, Long> {}
    interface DemoRequestRepository extends JpaRepository<DemoRequest, Long> {
        boolean existsByRequestCode(String requestCode);
        boolean existsByEmailAndDeletedFalse(String email);
        boolean existsByEmailAndStatusAndDeletedFalse(String email, String status);
        List<DemoRequest> findAllByDeletedFalseOrderByCreatedAtDesc();
        List<DemoRequest> findByStatusAndDeletedFalseOrderByCreatedAtDesc(String status);
        Optional<DemoRequest> findByIdAndDeletedFalse(Long id);
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select r from DemoRequest r where r.id = :id and r.deleted = false")
        Optional<DemoRequest> lockById(Long id);
    }
    interface DemoSchoolRepository extends JpaRepository<DemoSchool, Long> {
        boolean existsByDemoCode(String demoCode);
        boolean existsByUsernameAndDeletedFalse(String username);
        Optional<DemoSchool> findByDemoRequestIdAndDeletedFalse(Long demoRequestId);
        Optional<DemoSchool> findByIdAndDeletedFalse(Long id);
        Optional<DemoSchool> findByIdAndUsernameAndDeletedFalse(Long id, String username);
        Optional<DemoSchool> findBySchoolIdAndDeletedFalse(Long schoolId);
        List<DemoSchool> findAllByDeletedFalseOrderByCreatedAtDesc();
        List<DemoSchool> findByStatusInAndDeletedFalseOrderByCreatedAtDesc(Collection<String> statuses);
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select d from DemoSchool d where d.schoolId = :schoolId and d.deleted = false")
        Optional<DemoSchool> lockBySchoolIdAndDeletedFalse(Long schoolId);
    }
    interface DemoConversionHistoryRepository extends JpaRepository<DemoConversionHistory, Long> {
        boolean existsByConversionCode(String conversionCode);
        Optional<DemoConversionHistory> findByDemoSchoolIdAndDeletedFalse(Long demoSchoolId);
        Optional<DemoConversionHistory> findByPaidSchoolIdAndDeletedFalse(Long paidSchoolId);
    }
}
