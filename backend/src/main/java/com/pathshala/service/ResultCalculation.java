package com.pathshala.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

final class ResultCalculation {
    private ResultCalculation() {}

    record WeightedValue(BigDecimal gradePoint, BigDecimal creditHours, boolean eligible) {}
    record WeightedResult(BigDecimal gpa, BigDecimal totalCredits) {}

    static WeightedResult weightedGpa(List<WeightedValue> values) {
        BigDecimal credits = BigDecimal.ZERO;
        BigDecimal quality = BigDecimal.ZERO;
        for (WeightedValue value : values) {
            if (!value.eligible() || value.creditHours() == null || value.creditHours().signum() <= 0) continue;
            if (value.gradePoint() == null) return null;
            credits = credits.add(value.creditHours());
            quality = quality.add(value.gradePoint().multiply(value.creditHours()));
        }
        if (credits.signum() == 0) return null;
        return new WeightedResult(quality.divide(credits, 2, RoundingMode.HALF_UP), credits.stripTrailingZeros());
    }

    static String subjectStatus(boolean absent, boolean marksPass, boolean rulePassing, String grade) {
        if (absent) return "ABSENT";
        if (!rulePassing && "NG".equalsIgnoreCase(grade)) return "NG";
        return marksPass && rulePassing ? "PASS" : "FAIL";
    }

    static String overallStatus(List<String> statuses) {
        if (statuses.stream().anyMatch(status -> "ABSENT".equalsIgnoreCase(status))) return "ABSENT";
        if (statuses.stream().anyMatch(status -> "NG".equalsIgnoreCase(status))) return "NG";
        if (statuses.stream().anyMatch(status -> "FAIL".equalsIgnoreCase(status))) return "FAIL";
        return "PASS";
    }

    static boolean gradeRangeContains(BigDecimal percentage, BigDecimal minimum, BigDecimal maximum) {
        return percentage.compareTo(minimum) >= 0 && (maximum.compareTo(BigDecimal.valueOf(100)) == 0
                ? percentage.compareTo(maximum) <= 0 : percentage.compareTo(maximum) < 0);
    }

    static boolean validCgpaPeriod(List<WeightedValue> includedValues, List<Boolean> completeMarks) {
        return !includedValues.isEmpty() && includedValues.stream().allMatch(value -> value.creditHours() != null
                && value.creditHours().signum() > 0) && completeMarks.size() == includedValues.size()
                && completeMarks.stream().allMatch(Boolean.TRUE::equals);
    }
}
