package com.pathshala.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ResultCalculationTest {
    @Test
    void weightsDifferentCreditsWithoutRoundingIntermediateQuality() {
        var result = ResultCalculation.weightedGpa(List.of(
                value("4.00", "3"), value("2.975", "2")));

        assertEquals(new BigDecimal("3.59"), result.gpa());
        assertEquals(0, new BigDecimal("5").compareTo(result.totalCredits()));
    }

    @Test
    void roundsRecurringWeightedGpaHalfUpToTwoDecimals() {
        var result = ResultCalculation.weightedGpa(List.of(value("4", "1"), value("3", "2")));

        assertEquals(new BigDecimal("3.33"), result.gpa());
    }

    @Test
    void returnsExactThreePointSixtyFourForWeightedCredits() {
        var result = ResultCalculation.weightedGpa(List.of(value("4", "3"), value("3.1", "2")));

        assertEquals(new BigDecimal("3.64"), result.gpa());
    }

    @Test
    void ignoresIneligibleAndMissingCredits() {
        var result = ResultCalculation.weightedGpa(List.of(
                value("4", null),
                new ResultCalculation.WeightedValue(new BigDecimal("9"), new BigDecimal("3"), false)));

        assertNull(result);
    }

    @Test
    void absentStatusAlwaysWins() {
        assertEquals("ABSENT", ResultCalculation.subjectStatus(true, true, true, "A"));
    }

    @Test
    void nonPassingNgHasNgStatus() {
        assertEquals("NG", ResultCalculation.subjectStatus(false, false, false, "NG"));
    }

    @Test
    void failedMarksRemainFailForNonNgRule() {
        assertEquals("FAIL", ResultCalculation.subjectStatus(false, false, true, "C"));
    }

    @Test
    void passingMarksAndRuleProducePass() {
        assertEquals("PASS", ResultCalculation.subjectStatus(false, true, true, "B"));
    }

    @Test
    void gradeRangeIncludesZero() {
        assertEquals(true, ResultCalculation.gradeRangeContains(decimal("0"), decimal("0"), decimal("40")));
    }

    @Test
    void gradeRangeAssignsSharedBoundaryToUpperRule() {
        assertEquals(false, ResultCalculation.gradeRangeContains(decimal("40"), decimal("0"), decimal("40")));
        assertEquals(true, ResultCalculation.gradeRangeContains(decimal("40"), decimal("40"), decimal("60")));
    }

    @Test
    void gradeRangeIncludesOneHundredInFinalRule() {
        assertEquals(true, ResultCalculation.gradeRangeContains(decimal("100"), decimal("80"), decimal("100")));
    }

    @Test
    void explicitExclusionsProduceNullWeightedGpa() {
        assertNull(ResultCalculation.weightedGpa(List.of(new ResultCalculation.WeightedValue(decimal("4"), decimal("3"), false))));
    }

    @Test
    void cgpaPeriodAcceptsOnlyCompletePositiveIncludedValues() {
        assertEquals(true, ResultCalculation.validCgpaPeriod(List.of(value("4", "3")), List.of(true)));
        assertEquals(false, ResultCalculation.validCgpaPeriod(List.of(value("4", null)), List.of(true)));
        assertEquals(false, ResultCalculation.validCgpaPeriod(List.of(value("4", "3")), List.of(false)));
        assertEquals(false, ResultCalculation.validCgpaPeriod(List.of(), List.of()));
    }

    @Test
    void overallStatusUsesAbsentNgFailPassPrecedence() {
        assertEquals("ABSENT", ResultCalculation.overallStatus(List.of("PASS", "FAIL", "NG", "ABSENT")));
        assertEquals("NG", ResultCalculation.overallStatus(List.of("PASS", "FAIL", "NG")));
        assertEquals("FAIL", ResultCalculation.overallStatus(List.of("PASS", "FAIL")));
        assertEquals("PASS", ResultCalculation.overallStatus(List.of("PASS", "PASS")));
    }

    private ResultCalculation.WeightedValue value(String gradePoint, String credits) {
        return new ResultCalculation.WeightedValue(new BigDecimal(gradePoint), credits == null ? null : new BigDecimal(credits), true);
    }

    private BigDecimal decimal(String value) {
        return new BigDecimal(value);
    }
}
