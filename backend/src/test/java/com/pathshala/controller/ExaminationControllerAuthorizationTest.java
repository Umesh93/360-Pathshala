package com.pathshala.controller;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ExaminationControllerAuthorizationTest {
    @Test
    void scopePublicationRequiresAdministratorRole() throws Exception {
        Method publish = ExaminationController.class.getMethod("publishScope", Long.class, Long.class, Long.class, Long.class);
        Method unpublish = ExaminationController.class.getMethod("unpublishScope", Long.class, Long.class, Long.class, Long.class);

        assertEquals("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')", publish.getAnnotation(PreAuthorize.class).value());
        assertEquals("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')", unpublish.getAnnotation(PreAuthorize.class).value());
    }

    @Test
    void completeResultCollectionsRequireAdministratorRole() throws Exception {
        Method students = ExaminationController.class.getMethod("studentResults", Long.class, Long.class, Long.class, Long.class);
        Method merit = ExaminationController.class.getMethod("merit", Long.class, Long.class, Long.class, Long.class);
        assertEquals("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')", students.getAnnotation(PreAuthorize.class).value());
        assertEquals("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')", merit.getAnnotation(PreAuthorize.class).value());
    }

    @Test
    void directOfficialResultExcludesTeacherRole() throws Exception {
        Method result = ExaminationController.class.getMethod("result", Long.class, Long.class, Long.class);
        assertEquals("hasAnyRole('STUDENT','PARENT','SCHOOL_ADMIN','SUPER_ADMIN')", result.getAnnotation(PreAuthorize.class).value());
    }
}
