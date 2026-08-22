package com.pathshala.repository;

import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Lock;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ExaminationRepositoryLockTest {
    @Test
    void exactConcreteScopeUsesPessimisticWriteLock() throws Exception {
        Method method = Repositories.ExamClassAssignmentRepository.class.getMethod(
                "lockConcreteScope", Long.class, Long.class, Long.class, Long.class);
        assertEquals(LockModeType.PESSIMISTIC_WRITE, method.getAnnotation(Lock.class).value());
    }

    @Test
    void allConcreteScopesUsePessimisticWriteLock() throws Exception {
        Method method = Repositories.ExamClassAssignmentRepository.class.getMethod("lockConcreteScopes", Long.class, Long.class);
        assertEquals(LockModeType.PESSIMISTIC_WRITE, method.getAnnotation(Lock.class).value());
    }

    @Test
    void aggregateExamUsesPessimisticWriteLock() throws Exception {
        Method method = Repositories.ExamRepository.class.getMethod("lockBySchoolIdAndId", Long.class, Long.class);
        assertEquals(LockModeType.PESSIMISTIC_WRITE, method.getAnnotation(Lock.class).value());
    }
}
