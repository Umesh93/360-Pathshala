package com.pathshala.controller;

import com.pathshala.entity.ModuleCode;
import com.pathshala.repository.Repositories.*;
import com.pathshala.service.AttendanceService;
import com.pathshala.service.ModuleAccessService;
import com.pathshala.util.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

class StudentPhaseTwoAuthorizationTest {
    @Test
    void calendarUsesAcademicCalendarEntitlementAndStudentRole() throws Exception {
        ModuleAccessService modules = mock(ModuleAccessService.class);
        SecurityUtils security = mock(SecurityUtils.class);
        HolidayRepository holidays = mock(HolidayRepository.class);
        when(security.requiredSchoolId()).thenReturn(7L);
        AttendanceService service = new AttendanceService(mock(AttendanceRepository.class),
                mock(TeacherAttendanceRepository.class), mock(AttendanceCorrectionRepository.class), holidays,
                mock(AttendanceSettingsRepository.class), mock(StudentRepository.class), mock(TeacherRepository.class),
                mock(ParentRepository.class), mock(TeacherSubjectRepository.class), mock(AcademicYearRepository.class),
                mock(SchoolClassRepository.class), mock(SectionRepository.class), mock(NotificationRepository.class),
                modules, security);

        service.academicCalendar();

        verify(modules).require(7L, ModuleCode.ACADEMIC_CALENDAR);
        verify(holidays).findBySchoolIdAndDeletedFalseOrderByStartsOnAsc(7L);
        assertEquals("hasRole('STUDENT')", AttendanceController.class.getMethod("academicCalendar")
                .getAnnotation(PreAuthorize.class).value());
        assertEquals("hasRole('STUDENT')", PeopleController.class.getMethod("studentSelf")
                .getAnnotation(PreAuthorize.class).value());
    }
}
