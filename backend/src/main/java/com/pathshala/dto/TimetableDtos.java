package com.pathshala.dto;

import com.pathshala.entity.Timetable;
import com.pathshala.entity.TimetablePeriod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

public final class TimetableDtos {
    private TimetableDtos() {}

    public record PeriodRequest(@NotNull Long academicSessionId, @NotBlank String name, Integer periodNumber,
                                @NotNull LocalTime startTime, @NotNull LocalTime endTime,
                                @NotNull TimetablePeriod.Type type, Boolean active) {}
    public record WorkingDaysRequest(@NotNull Long academicSessionId,
                                     @NotNull List<@NotNull DayOfWeek> days) {}
    public record TeacherScope(Long subjectId, String subjectName, String subjectCode,
                               Long teacherId, String teacherName) {}
    public record GridCellRequest(@NotNull DayOfWeek dayOfWeek, @NotNull Long periodId,
                                  Long subjectId, String room, String remarks) {}
    public record GridRequest(@NotNull Long academicSessionId, @NotNull Long classId, @NotNull Long sectionId,
                              String name, LocalDate effectiveFrom, LocalDate effectiveTo,
                              @NotNull List<@Valid GridCellRequest> cells) {}
    public record StatusRequest(@NotNull Timetable.Status status) {}
    public record CopyScope(@NotNull Long academicSessionId, @NotNull Long classId, @NotNull Long sectionId) {}
    public record CopyRequest(@NotNull @Valid CopyScope source, @NotNull @Valid CopyScope target,
                              String name, LocalDate effectiveFrom, LocalDate effectiveTo) {}
    public record PeriodResponse(Long id, Long academicSessionId, String name, Integer periodNumber,
                                 LocalTime startTime, LocalTime endTime, TimetablePeriod.Type type, boolean active) {}
    public record EntryResponse(Long id, Long periodId, DayOfWeek dayOfWeek, Long subjectId,
                                String subjectName, Long teacherId, String teacherName,
                                String room, String remarks) {}
    public record TimetableResponse(Long id, Long academicSessionId, String academicSessionName,
                                    Long classId, String className, Long sectionId, String sectionName,
                                    String name, Timetable.Status status, LocalDate effectiveFrom,
                                    LocalDate effectiveTo, List<DayOfWeek> workingDays,
                                    List<PeriodResponse> periods, List<EntryResponse> entries) {}
    public record ReportRow(Long timetableId, String timetableName, Long classId, String className,
                            Long sectionId, String sectionName, DayOfWeek dayOfWeek, Long periodId,
                            String periodName, Integer periodNumber, LocalTime startTime, LocalTime endTime,
                            Long subjectId, String subjectName, Long teacherId, String teacherName,
                            String room, String remarks) {}
    public record ScheduleResponse(String view, LocalDate today, List<ReportRow> todayEntries,
                                   List<ReportRow> tomorrowEntries, List<ReportRow> weeklyEntries,
                                   List<String> freePeriods) {}
    public record ChildSchedule(Long studentId, String studentName, String className,
                                String sectionName, ScheduleResponse schedule) {}
    public record Dashboard(long totalTimetables, long activeTimetables, long classesScheduledToday,
                            long teachersScheduledToday, long freePeriods, long upcomingChanges,
                            Map<String, Long> classesPerDay, Map<String, Long> teacherWorkload,
                            Map<String, Long> subjectDistribution,
                            Map<String, Long> weeklyPeriodDistribution) {}
}
