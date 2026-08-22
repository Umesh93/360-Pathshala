package com.pathshala.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ExaminationScopePolicyTest {
    private record Row(Long classId, Long sectionId) {}

    @Test
    void publishedSectionAIsVisibleWhileSectionBRemainsHidden() {
        LocalDate today = LocalDate.of(2026, 8, 8);
        assertTrue(ExaminationService.scopeVisible(true, today, today));
        assertFalse(ExaminationService.scopeVisible(false, today, today));
    }

    @Test
    void aggregatePublishesOnlyWhenEveryConcreteScopeIsPublished() {
        assertFalse(ExaminationService.aggregatePublished(List.of(true, false)));
        assertTrue(ExaminationService.aggregatePublished(List.of(true, true)));
        assertFalse(ExaminationService.aggregatePublished(List.of()));
    }

    @Test
    void unpublishImmediatelyRemovesVisibility() {
        assertFalse(ExaminationService.scopeVisible(false, LocalDate.now(), LocalDate.now()));
    }

    @Test
    void marksLockTracksExactScopePublication() {
        assertTrue(ExaminationService.scopeLocked(true));
        assertFalse(ExaminationService.scopeLocked(false));
    }

    @Test
    void scopedFilterDoesNotLeakAnotherSection() {
        List<Row> rows = List.of(new Row(10L, 101L), new Row(10L, 102L), new Row(11L, 103L));
        assertEquals(List.of(new Row(10L, 101L)), ExaminationService.filterScope(rows, Row::classId, Row::sectionId, 10L, 101L));
    }

    @Test
    void oneHistoricalScopeIsSelected() {
        var scope = new ExaminationService.ResultScope(10L, 101L);
        assertEquals(scope, ExaminationService.selectHistoricalScope(Set.of(scope)));
    }

    @Test
    void multipleHistoricalScopesAreRejectedAsAmbiguous() {
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> ExaminationService.selectHistoricalScope(
                Set.of(new ExaminationService.ResultScope(10L, 101L), new ExaminationService.ResultScope(10L, 102L))));
        assertTrue(error.getMessage().contains("Ambiguous historical result scope"));
    }

    @Test
    void publishedCompletenessUsesSnapshotSemantics() {
        assertTrue(ExaminationService.publishedScopeComplete(true));
        assertFalse(ExaminationService.publishedScopeComplete(false));
    }
}
