package com.pathshala.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathshala.dto.ApiDtos.StudentLoginAccountRequest;
import com.pathshala.entity.*;
import com.pathshala.repository.Repositories.*;
import com.pathshala.security.UserPrincipal;
import com.pathshala.service.ModuleAccessService;
import com.pathshala.service.PeopleIdentifierService;
import com.pathshala.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StudentAccountProvisioningTest {
    private final StudentRepository students = mock(StudentRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final ModuleAccessService modules = mock(ModuleAccessService.class);
    private final SecurityUtils security = mock(SecurityUtils.class);
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private PeopleController controller;
    private Student student;

    @BeforeEach
    void setUp() {
        User admin = new User(); admin.setId(4L); admin.setSchoolId(9L); admin.setUsername("admin");
        admin.setEmail("admin@example.test"); admin.setPassword("unused"); admin.setRoles(Set.of(RoleName.SCHOOL_ADMIN));
        when(security.currentUser()).thenReturn(new UserPrincipal(admin));
        when(security.requiredSchoolId()).thenReturn(9L);
        student = new Student(); student.setId(55L); student.setSchoolId(9L); student.setFirstName("Student");
        student.setLastName("User"); student.setAdmissionNumber("ADM-55");
        when(students.findByIdAndSchoolIdAndDeletedFalse(55L, 9L)).thenReturn(Optional.of(student));
        when(students.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(users.save(any(User.class))).thenAnswer(invocation -> { User user = invocation.getArgument(0); user.setId(81L); return user; });
        controller = new PeopleController(students, mock(SchoolRepository.class), mock(TeacherRepository.class),
                mock(ParentRepository.class), users, mock(SchoolClassRepository.class), mock(SectionRepository.class),
                mock(AcademicYearRepository.class), mock(ProvinceRepository.class), mock(DistrictRepository.class),
                mock(MunicipalityRepository.class), mock(WardRepository.class), mock(TeacherSubjectRepository.class),
                mock(LeaveRequestRepository.class), security, modules, mock(PeopleIdentifierService.class), new ObjectMapper(), encoder);
    }

    @Test
    void createsBcryptStudentAccountAndLinksStudent() {
        var response = controller.createStudentLoginAccount(55L,
                new StudentLoginAccountRequest("student@example.test", "student.user", "StudentPass1", "StudentPass1"));
        ArgumentCaptor<User> account = ArgumentCaptor.forClass(User.class);
        verify(users).save(account.capture());
        assertTrue(encoder.matches("StudentPass1", account.getValue().getPassword()));
        assertNotEquals("StudentPass1", account.getValue().getPassword());
        assertNull(account.getValue().getRawPassword());
        assertEquals(Set.of(RoleName.STUDENT), account.getValue().getRoles());
        assertTrue(account.getValue().isActive());
        assertEquals(9L, account.getValue().getSchoolId());
        assertEquals(81L, student.getUserId());
        assertEquals(81L, response.userId());
        verify(modules).require(9L, ModuleCode.STUDENT_MANAGEMENT);
    }

    @Test
    void rejectsDuplicateUsernameWithoutCreatingOrLinkingAccount() {
        when(users.findByUsernameAndDeletedFalse("student.user")).thenReturn(Optional.of(new User()));
        assertEquals("Username already exists", assertThrows(IllegalArgumentException.class,
                () -> controller.createStudentLoginAccount(55L,
                        new StudentLoginAccountRequest("student@example.test", "student.user", "StudentPass1", "StudentPass1"))).getMessage());
        verify(users, never()).save(any());
        assertNull(student.getUserId());
    }

    @Test
    void rejectsDuplicateEmailWithoutCreatingOrLinkingAccount() {
        when(users.findByEmailIgnoreCaseAndDeletedFalse("student@example.test")).thenReturn(Optional.of(new User()));
        assertEquals("Email already exists", assertThrows(IllegalArgumentException.class,
                () -> controller.createStudentLoginAccount(55L,
                        new StudentLoginAccountRequest("student@example.test", "student.user", "StudentPass1", "StudentPass1"))).getMessage());
        verify(users, never()).save(any());
        assertNull(student.getUserId());
    }
}
