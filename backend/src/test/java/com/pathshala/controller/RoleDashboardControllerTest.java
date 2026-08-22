package com.pathshala.controller;

import com.pathshala.dto.ApiDtos.ParentDashboardResponse;
import com.pathshala.dto.ApiDtos.SelfProfile;
import com.pathshala.entity.RoleName;
import com.pathshala.entity.Student;
import com.pathshala.entity.Teacher;
import com.pathshala.entity.User;
import com.pathshala.repository.Repositories.*;
import com.pathshala.security.UserPrincipal;
import com.pathshala.service.*;
import com.pathshala.util.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoleDashboardControllerTest {
    private final StudentRepository students = mock(StudentRepository.class);
    private final TeacherRepository teachers = mock(TeacherRepository.class);
    private final AttendanceRepository attendanceRepository = mock(AttendanceRepository.class);
    private final SchoolModuleRepository schoolModules = mock(SchoolModuleRepository.class);
    private final FeeCollectionRepository fees = mock(FeeCollectionRepository.class);
    private final AssignmentService assignments = mock(AssignmentService.class);
    private final AttendanceService attendance = mock(AttendanceService.class);
    private final ExaminationService examinations = mock(ExaminationService.class);
    private final SubjectService subjects = mock(SubjectService.class);
    private final SecurityUtils security = mock(SecurityUtils.class);
    private final SchoolClassRepository classes = mock(SchoolClassRepository.class);
    private final SectionRepository sections = mock(SectionRepository.class);
    private final AcademicYearRepository years = mock(AcademicYearRepository.class);
    private final DashboardController controller = new DashboardController(students, teachers, attendanceRepository,
            mock(TeacherAttendanceRepository.class), years, classes, sections, mock(SubjectRepository.class),
            mock(LeaveRequestRepository.class), mock(ExamRepository.class), mock(ExamClassAssignmentRepository.class),
            mock(AssignmentRepository.class), schoolModules, fees, mock(FeeStructureRepository.class),
            mock(SchoolRepository.class), mock(ModuleAccessService.class), assignments, security, attendance,
            examinations, subjects);

    @Test
    void teacherSummaryRequiresTeacherRole() throws Exception {
        assertAuthorize("teacherSummary", "hasRole('TEACHER')");
    }

    @Test
    void studentSummaryRequiresStudentRole() throws Exception {
        assertAuthorize("studentSummary", "hasRole('STUDENT')");
    }

    @Test
    void parentSummaryRequiresParentRole() throws Exception {
        assertAuthorize("parentSummary", "hasRole('PARENT')");
    }

    @Test
    void parentSummaryIsEmptyComingSoonShape() {
        ParentDashboardResponse response = controller.parentSummary();
        assertEquals("COMING_SOON", response.status());
        assertFalse(response.enabled());
        verifyNoInteractions(fees, attendanceRepository, attendance, assignments);
    }

    @Test
    void legacyParentDoesNotReadFeesOrSchoolAttendance() {
        assertEquals(new ParentDashboardResponse("COMING_SOON", false), controller.parent());
        verifyNoInteractions(fees, attendanceRepository, attendance, assignments);
    }

    @Test
    void disabledTeacherModulesOmitAllOptionalSections() {
        authenticate(21L, 7L, RoleName.TEACHER);
        Teacher teacher = teacher(31L, 7L, 21L);
        when(teachers.findBySchoolIdAndUserIdAndStatusIgnoreCaseAndDeletedFalse(7L, 21L, "ACTIVE")).thenReturn(Optional.of(teacher));
        when(schoolModules.findBySchoolIdAndActiveTrueAndDeletedFalse(7L)).thenReturn(List.of());
        when(years.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(7L)).thenReturn(Optional.empty());

        var response = controller.teacherSummary();

        assertNull(response.assignments());
        assertNull(response.teacherAttendance());
        assertNull(response.examinations());
        assertTrue(response.teachingAssignments().isEmpty());
        verifyNoInteractions(assignments, attendance, examinations, subjects);
    }

    @Test
    void disabledStudentModulesOmitAllOptionalSectionsAndUseAuthenticatedProfile() {
        authenticate(22L, 7L, RoleName.STUDENT);
        Student student = student(32L, 7L, 22L);
        when(students.findBySchoolIdAndUserIdAndDeletedFalse(7L, 22L)).thenReturn(Optional.of(student));
        when(schoolModules.findBySchoolIdAndActiveTrueAndDeletedFalse(7L)).thenReturn(List.of());
        when(years.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(7L)).thenReturn(Optional.empty());

        var response = controller.studentSummary();

        assertEquals(32L, response.profile().personId());
        assertNull(response.assignments());
        assertNull(response.attendance());
        assertNull(response.results());
        verify(students).findBySchoolIdAndUserIdAndDeletedFalse(7L, 22L);
        verifyNoInteractions(assignments, attendance, examinations);
    }

    @Test
    void peopleSelfReturnsOnlyOwnedStudentProfile() {
        StudentRepository peopleStudents = mock(StudentRepository.class);
        SecurityUtils peopleSecurity = mock(SecurityUtils.class);
        UserPrincipal principal = principal(45L, 9L, RoleName.STUDENT);
        when(peopleSecurity.currentUser()).thenReturn(principal);
        when(peopleSecurity.requiredSchoolId()).thenReturn(9L);
        Student student = student(55L, 9L, 45L);
        student.setPhoto("photo-key");
        when(peopleStudents.findBySchoolIdAndUserIdAndDeletedFalse(9L, 45L)).thenReturn(Optional.of(student));
        PeopleController people = new PeopleController(peopleStudents, mock(SchoolRepository.class), mock(TeacherRepository.class),
                mock(ParentRepository.class), mock(UserRepository.class), mock(SchoolClassRepository.class), mock(SectionRepository.class),
                mock(AcademicYearRepository.class), mock(ProvinceRepository.class), mock(DistrictRepository.class),
                mock(MunicipalityRepository.class), mock(WardRepository.class), mock(TeacherSubjectRepository.class),
                mock(LeaveRequestRepository.class), peopleSecurity, mock(ModuleAccessService.class),
                mock(PeopleIdentifierService.class), new com.fasterxml.jackson.databind.ObjectMapper());

        SelfProfile profile = people.self();

        assertEquals(55L, profile.personId());
        assertEquals(9L, profile.schoolId());
        assertEquals("photo-key", profile.photo());
        assertNull(profile.employeeNumber());
        verify(peopleStudents).findBySchoolIdAndUserIdAndDeletedFalse(9L, 45L);
    }

    private void assertAuthorize(String methodName, String expected) throws Exception {
        Method method = DashboardController.class.getMethod(methodName);
        assertEquals(expected, method.getAnnotation(PreAuthorize.class).value());
    }

    private void authenticate(Long userId, Long schoolId, RoleName role) {
        when(security.currentUser()).thenReturn(principal(userId, schoolId, role));
        when(security.requiredSchoolId()).thenReturn(schoolId);
    }

    private static UserPrincipal principal(Long userId, Long schoolId, RoleName role) {
        User user = new User(); user.setId(userId); user.setSchoolId(schoolId); user.setUsername("user" + userId);
        user.setEmail("user" + userId + "@example.test"); user.setPassword("unused"); user.setActive(true); user.setRoles(Set.of(role));
        return new UserPrincipal(user);
    }

    private static Teacher teacher(Long id, Long schoolId, Long userId) {
        Teacher teacher = new Teacher(); teacher.setId(id); teacher.setSchoolId(schoolId); teacher.setUserId(userId);
        teacher.setFirstName("Owned"); teacher.setLastName("Teacher"); teacher.setEmployeeNumber("TCH-1");
        return teacher;
    }

    private static Student student(Long id, Long schoolId, Long userId) {
        Student student = new Student(); student.setId(id); student.setSchoolId(schoolId); student.setUserId(userId);
        student.setFirstName("Owned"); student.setLastName("Student");
        return student;
    }
}
