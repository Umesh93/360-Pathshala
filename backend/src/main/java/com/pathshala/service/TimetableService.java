package com.pathshala.service;

import com.pathshala.dto.TimetableDtos.*;
import com.pathshala.entity.*;
import com.pathshala.exception.ForbiddenException;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.repository.Repositories.*;
import com.pathshala.util.SecurityUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TimetableService {
    private final TimetablePeriodRepository periodRepository;
    private final TimetableWorkingDayRepository workingDayRepository;
    private final TimetableRepository timetableRepository;
    private final TimetableEntryRepository entryRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final ModuleAccessService moduleAccessService;
    private final SecurityUtils security;

    public Long school(Long requestedSchoolId) {
        Long schoolId = security.schoolScope(requestedSchoolId);
        moduleAccessService.require(schoolId, ModuleCode.TIMETABLE);
        return schoolId;
    }

    public List<TimetablePeriod> periods(Long requestedSchoolId, Long sessionId, boolean includeInactive) {
        Long s = school(requestedSchoolId);
        session(s, sessionId);
        return periodRepository.findBySchoolIdAndAcademicSessionIdAndDeletedFalseOrderByStartTimeAsc(s, sessionId).stream()
                .filter(period -> includeInactive || period.isActive()).toList();
    }

    public TimetablePeriod createPeriod(Long requestedSchoolId, PeriodRequest request) {
        Long s = school(requestedSchoolId); requireAdmin();
        validatePeriod(s, null, request);
        TimetablePeriod period = new TimetablePeriod(); period.setSchoolId(s); copyPeriod(period, request);
        return periodRepository.save(period);
    }

    public TimetablePeriod updatePeriod(Long requestedSchoolId, Long id, PeriodRequest request) {
        Long s = school(requestedSchoolId); requireAdmin(); TimetablePeriod period = period(s, id);
        if (!period.getAcademicSessionId().equals(request.academicSessionId()) && entryRepository.existsBySchoolIdAndPeriodIdAndDeletedFalse(s, id))
            throw new IllegalArgumentException("A period used by a timetable cannot change academic session");
        validatePeriod(s, id, request); copyPeriod(period, request); return periodRepository.save(period);
    }

    public TimetablePeriod periodStatus(Long requestedSchoolId, Long id, boolean active) {
        Long s = school(requestedSchoolId); requireAdmin(); TimetablePeriod period = period(s, id);
        if (!active && entryRepository.existsBySchoolIdAndPeriodIdAndDeletedFalse(s, id))
            throw new IllegalArgumentException("A period used by a timetable cannot be deactivated");
        period.setActive(active); return periodRepository.save(period);
    }

    public void deletePeriod(Long requestedSchoolId, Long id) {
        Long s = school(requestedSchoolId); requireAdmin(); TimetablePeriod period = period(s, id);
        if (entryRepository.existsBySchoolIdAndPeriodIdAndDeletedFalse(s, id))
            throw new IllegalArgumentException("A period used by a timetable cannot be deleted");
        period.setDeleted(true); period.setActive(false); periodRepository.save(period);
    }

    public List<DayOfWeek> workingDays(Long requestedSchoolId, Long sessionId) {
        Long s = school(requestedSchoolId); session(s, sessionId);
        return activeDays(s, sessionId).stream().sorted().toList();
    }

    public List<DayOfWeek> replaceWorkingDays(Long requestedSchoolId, WorkingDaysRequest request) {
        Long s = school(requestedSchoolId); requireAdmin(); session(s, request.academicSessionId());
        Set<DayOfWeek> requested = new LinkedHashSet<>(request.days());
        if (requested.size() != request.days().size()) throw new IllegalArgumentException("Duplicate working day");
        Set<DayOfWeek> removed = new HashSet<>(activeDays(s, request.academicSessionId())); removed.removeAll(requested);
        if (!removed.isEmpty()) {
            List<Long> timetableIds = timetableRepository.findBySchoolIdAndAcademicSessionIdAndStatusNotAndDeletedFalse(s, request.academicSessionId(), Timetable.Status.ARCHIVED).stream().map(Timetable::getId).toList();
            if (!timetableIds.isEmpty() && entryRepository.findBySchoolIdAndTimetableIdInAndDeletedFalse(s, timetableIds).stream().anyMatch(entry -> removed.contains(entry.getDayOfWeek())))
                throw new IllegalArgumentException("Working days used by timetable entries cannot be removed: " + removed);
        }
        Map<DayOfWeek, TimetableWorkingDay> existing = workingDayRepository
                .findBySchoolIdAndAcademicSessionIdAndDeletedFalseOrderByDayOfWeekAsc(s, request.academicSessionId()).stream()
                .collect(Collectors.toMap(TimetableWorkingDay::getDayOfWeek, Function.identity()));
        for (DayOfWeek day : DayOfWeek.values()) {
            TimetableWorkingDay row = existing.get(day);
            if (row == null && !requested.contains(day)) continue;
            if (row == null) {
                row = workingDayRepository.findBySchoolIdAndAcademicSessionIdAndDayOfWeek(s, request.academicSessionId(), day).orElseGet(TimetableWorkingDay::new);
                row.setSchoolId(s); row.setAcademicSessionId(request.academicSessionId()); row.setDayOfWeek(day); row.setDeleted(false);
            }
            row.setActive(requested.contains(day)); workingDayRepository.save(row);
        }
        return requested.stream().sorted().toList();
    }

    public List<TeacherScope> teacherScopes(Long requestedSchoolId, Long sessionId, Long classId, Long sectionId) {
        Long s = school(requestedSchoolId); validateScope(s, sessionId, classId, sectionId);
        return teacherSubjectRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndDeletedFalse(s, sessionId, classId, sectionId).stream()
                .map(mapping -> {
                    Subject subject = activeSubject(s, classId, mapping.getSubjectId());
                    Teacher teacher = activeTeacher(s, mapping.getTeacherId());
                    return new TeacherScope(subject.getId(), subject.getSubjectName(), subject.getSubjectCode(), teacher.getId(), teacherName(teacher));
                }).sorted(Comparator.comparing(TeacherScope::subjectName, String.CASE_INSENSITIVE_ORDER)).toList();
    }

    public TimetableResponse grid(Long requestedSchoolId, Long sessionId, Long classId, Long sectionId) {
        Long s = school(requestedSchoolId); validateScope(s, sessionId, classId, sectionId);
        Timetable timetable = canonical(s, sessionId, classId, sectionId);
        return response(s, timetable);
    }

    public TimetableResponse replaceGrid(Long requestedSchoolId, GridRequest request) {
        Long s = school(requestedSchoolId); requireAdmin(); validateScope(s, request.academicSessionId(), request.classId(), request.sectionId());
        validateDates(request.effectiveFrom(), request.effectiveTo());
        Map<Long, TimetablePeriod> periods = configuredPeriods(s, request.academicSessionId());
        Set<DayOfWeek> days = configuredDays(s, request.academicSessionId());
        validateCells(s, request, periods, days);
        Timetable timetable = timetableRepository.findFirstBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndStatusNotAndDeletedFalseOrderByUpdatedAtDesc(
                s, request.academicSessionId(), request.classId(), request.sectionId(), Timetable.Status.ARCHIVED).orElseGet(Timetable::new);
        if (timetable.getId() == null) {
            assertCanonical(s, request.academicSessionId(), request.classId(), request.sectionId());
            timetable.setSchoolId(s); timetable.setAcademicSessionId(request.academicSessionId());
            timetable.setClassId(request.classId()); timetable.setSectionId(request.sectionId()); timetable.setStatus(Timetable.Status.DRAFT);
        }
        timetable.setName(text(request.name()) == null ? defaultName(s, request.classId(), request.sectionId()) : request.name().trim());
        timetable.setEffectiveFrom(request.effectiveFrom()); timetable.setEffectiveTo(request.effectiveTo()); timetableRepository.save(timetable);
        List<TimetableEntry> old = entryRepository.findBySchoolIdAndTimetableIdAndDeletedFalse(s, timetable.getId());
        entryRepository.deleteAllInBatch(old); entryRepository.flush();
        entryRepository.saveAll(entriesFor(s, timetable, request.cells(), periods));
        return response(s, timetable);
    }

    public TimetableResponse status(Long requestedSchoolId, Long timetableId, Timetable.Status status) {
        Long s = school(requestedSchoolId); requireAdmin(); Timetable timetable = timetable(s, timetableId);
        if (status == Timetable.Status.ACTIVE) {
            Map<Long, TimetablePeriod> periods = configuredPeriods(s, timetable.getAcademicSessionId()); Set<DayOfWeek> days = configuredDays(s, timetable.getAcademicSessionId());
            List<TimetableEntry> persisted = entryRepository.findBySchoolIdAndTimetableIdAndDeletedFalse(s, timetableId);
            if (persisted.isEmpty()) throw new IllegalArgumentException("An empty timetable cannot be activated");
            List<GridCellRequest> cells = persisted.stream().map(entry -> new GridCellRequest(entry.getDayOfWeek(), entry.getPeriodId(), entry.getSubjectId(), entry.getRoom(), entry.getRemarks())).toList();
            GridRequest validation = new GridRequest(timetable.getAcademicSessionId(), timetable.getClassId(), timetable.getSectionId(), timetable.getName(), timetable.getEffectiveFrom(), timetable.getEffectiveTo(), cells);
            validateCells(s, validation, periods, days); entriesFor(s, timetable, cells, periods);
            assertNoOtherCanonical(s, timetable);
        }
        timetable.setStatus(status); timetableRepository.save(timetable); return response(s, timetable);
    }

    public void deleteGrid(Long requestedSchoolId, Long sessionId, Long classId, Long sectionId) {
        Long s = school(requestedSchoolId); requireAdmin(); deleteTimetable(s, canonical(s, sessionId, classId, sectionId));
    }

    public void deleteTimetable(Long requestedSchoolId, Long timetableId) {
        Long s = school(requestedSchoolId); requireAdmin(); deleteTimetable(s, timetable(s, timetableId));
    }

    public TimetableResponse copy(Long requestedSchoolId, CopyRequest request) {
        Long s = school(requestedSchoolId); requireAdmin();
        CopyScope sourceScope = request.source(), targetScope = request.target();
        validateScope(s, sourceScope.academicSessionId(), sourceScope.classId(), sourceScope.sectionId());
        validateScope(s, targetScope.academicSessionId(), targetScope.classId(), targetScope.sectionId());
        validateDates(request.effectiveFrom(), request.effectiveTo());
        Timetable source = canonical(s, sourceScope.academicSessionId(), sourceScope.classId(), sourceScope.sectionId());
        if (timetableRepository.findFirstBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndStatusNotAndDeletedFalseOrderByUpdatedAtDesc(
                s, targetScope.academicSessionId(), targetScope.classId(), targetScope.sectionId(), Timetable.Status.ARCHIVED).isPresent())
            throw new IllegalArgumentException("Target already has a non-archived timetable");
        Map<Long, TimetablePeriod> sourcePeriods = configuredPeriods(s, sourceScope.academicSessionId());
        Map<Long, TimetablePeriod> targetPeriods = configuredPeriods(s, targetScope.academicSessionId());
        Set<DayOfWeek> targetDays = configuredDays(s, targetScope.academicSessionId());
        Map<String, TimetablePeriod> targetByKey = targetPeriods.values().stream().collect(Collectors.toMap(this::periodKey, Function.identity(), (a, b) -> a));
        List<GridCellRequest> cells = new ArrayList<>();
        for (TimetableEntry entry : entryRepository.findBySchoolIdAndTimetableIdAndDeletedFalse(s, source.getId())) {
            TimetablePeriod sourcePeriod = sourcePeriods.get(entry.getPeriodId());
            TimetablePeriod targetPeriod = sourcePeriod == null ? null : targetByKey.get(periodKey(sourcePeriod));
            if (targetPeriod == null) throw new IllegalArgumentException("No matching target period for " + (sourcePeriod == null ? entry.getPeriodId() : sourcePeriod.getName()));
            if (!targetDays.contains(entry.getDayOfWeek())) throw new IllegalArgumentException("Target working days do not include " + entry.getDayOfWeek());
            if (entry.getSubjectId() != null) mapping(s, targetScope, entry.getSubjectId());
            cells.add(new GridCellRequest(entry.getDayOfWeek(), targetPeriod.getId(), entry.getSubjectId(), entry.getRoom(), entry.getRemarks()));
        }
        return replaceGrid(requestedSchoolId, new GridRequest(targetScope.academicSessionId(), targetScope.classId(), targetScope.sectionId(),
                text(request.name()) == null ? source.getName() + " Copy" : request.name(), request.effectiveFrom(), request.effectiveTo(), cells));
    }

    public List<ReportRow> report(Long requestedSchoolId, String type, Long sessionId, Long classId, Long sectionId, Long teacherId, String room) {
        Long s = school(requestedSchoolId); requireStaff(); session(s, sessionId);
        String reportType = text(type) == null ? "weekly" : type.trim().toLowerCase();
        if (!Set.of("weekly", "teacher", "class", "section", "room").contains(reportType)) throw new IllegalArgumentException("Invalid report type");
        if (reportType.equals("teacher") && teacherId == null) throw new IllegalArgumentException("teacherId is required");
        if (reportType.equals("class") && classId == null) throw new IllegalArgumentException("classId is required");
        if (reportType.equals("section") && sectionId == null) throw new IllegalArgumentException("sectionId is required");
        if (reportType.equals("room") && text(room) == null) throw new IllegalArgumentException("room is required");
        List<ReportRow> rows = reportRows(s, sessionId);
        if (classId != null) rows = rows.stream().filter(row -> classId.equals(row.classId())).toList();
        if (sectionId != null) rows = rows.stream().filter(row -> sectionId.equals(row.sectionId())).toList();
        if (teacherId != null) rows = rows.stream().filter(row -> teacherId.equals(row.teacherId())).toList();
        if (text(room) != null) rows = rows.stream().filter(row -> room.trim().equalsIgnoreCase(Objects.toString(row.room(), ""))).toList();
        if (security.hasRole(RoleName.TEACHER)) {
            rows = currentTeacherRows(s, sessionId, rows);
        }
        return rows;
    }

    public byte[] exportCsv(Long schoolId, String type, Long sessionId, Long classId, Long sectionId, Long teacherId, String room) {
        StringBuilder out = new StringBuilder("Day,Period,Start,End,Class,Section,Subject,Teacher,Room,Remarks\r\n");
        for (ReportRow row : report(schoolId, type, sessionId, classId, sectionId, teacherId, room)) {
            out.append(row.dayOfWeek()).append(',').append(csv(row.periodName())).append(',').append(row.startTime()).append(',').append(row.endTime()).append(',')
                    .append(csv(row.className())).append(',').append(csv(row.sectionName())).append(',').append(csv(row.subjectName())).append(',')
                    .append(csv(row.teacherName())).append(',').append(csv(row.room())).append(',').append(csv(row.remarks())).append("\r\n");
        }
        return out.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportExcel(Long schoolId, String type, Long sessionId, Long classId, Long sectionId, Long teacherId, String room) {
        List<ReportRow> rows = report(schoolId, type, sessionId, classId, sectionId, teacherId, room);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Timetable"); String[] headings = {"Day", "Period", "Start", "End", "Class", "Section", "Subject", "Teacher", "Room", "Remarks"};
            Font font = workbook.createFont(); font.setBold(true); CellStyle style = workbook.createCellStyle(); style.setFont(font); Row header = sheet.createRow(0);
            for (int i = 0; i < headings.length; i++) { header.createCell(i).setCellValue(headings[i]); header.getCell(i).setCellStyle(style); }
            int index = 1; for (ReportRow value : rows) { Row row = sheet.createRow(index++); Object[] cells = {value.dayOfWeek(), value.periodName(), value.startTime(), value.endTime(), value.className(), value.sectionName(), value.subjectName(), value.teacherName(), value.room(), value.remarks()}; for (int i = 0; i < cells.length; i++) row.createCell(i).setCellValue(Objects.toString(cells[i], "")); }
            for (int i = 0; i < headings.length; i++) sheet.autoSizeColumn(i); workbook.write(output); return output.toByteArray();
        } catch (IOException exception) { throw new IllegalStateException("Unable to create timetable workbook", exception); }
    }

    public byte[] exportPdf(Long schoolId, String type, Long sessionId, Long classId, Long sectionId, Long teacherId, String room) {
        List<String> lines = new ArrayList<>(List.of("Weekly Timetable"));
        report(schoolId, type, sessionId, classId, sectionId, teacherId, room).forEach(row -> lines.add(row.dayOfWeek() + "  " + row.periodName() + "  " + row.startTime() + "-" + row.endTime() + "  " + row.className() + "/" + row.sectionName() + "  " + Objects.toString(row.subjectName(), row.periodName()) + "  " + Objects.toString(row.teacherName(), "") + "  " + Objects.toString(row.room(), "")));
        return simplePdf(lines);
    }

    public ScheduleResponse teacherSelf(Long requestedSessionId) {
        Long s = school(null); requireRole(RoleName.TEACHER); Teacher teacher = currentTeacher(s); Long sessionId = activeOrRequestedSession(s, requestedSessionId);
        return schedule("teacher", sessionId, currentTeacherRows(s, sessionId, reportRows(s, sessionId)), s, null, null, teacher.getId());
    }

    public ScheduleResponse studentSelf() {
        Long s = school(null); requireRole(RoleName.STUDENT); Student student = studentRepository.findBySchoolIdAndUserIdAndDeletedFalse(s, security.currentUser().getId()).orElseThrow(() -> new ForbiddenException("Student profile mapping not found"));
        requireActive(student.getStatus(), "Active student profile required"); Long sessionId = activeSession(s).getId();
        return schedule("student", sessionId, classSchedule(s, sessionId, student.getClassId(), student.getSectionId()), s, student.getClassId(), student.getSectionId(), null);
    }

    public List<ChildSchedule> parentSelf() {
        Long s = school(null); requireRole(RoleName.PARENT); Parent parent = parentRepository.findBySchoolIdAndUserIdAndDeletedFalse(s, security.currentUser().getId()).orElseThrow(() -> new ForbiddenException("Parent profile mapping not found"));
        requireActive(parent.getStatus(), "Active parent profile required"); Long sessionId = activeSession(s).getId();
        List<Student> children = studentRepository.findBySchoolIdAndParentIdAndDeletedFalse(s, parent.getId()).stream().filter(student -> "ACTIVE".equalsIgnoreCase(student.getStatus())).toList();
        if (children.isEmpty()) throw new ForbiddenException("No active students are linked to this parent profile");
        return children.stream().map(student -> new ChildSchedule(student.getId(), studentName(student), className(s, student.getClassId()), sectionName(s, student.getSectionId()), schedule("parent-child", sessionId, classSchedule(s, sessionId, student.getClassId(), student.getSectionId()), s, student.getClassId(), student.getSectionId(), null))).toList();
    }

    public Dashboard dashboard(Long requestedSchoolId, Long sessionId) {
        Long s = school(requestedSchoolId); requireStaff(); session(s, sessionId); List<Timetable> timetables = timetableRepository.findBySchoolIdAndAcademicSessionIdAndDeletedFalse(s, sessionId); List<ReportRow> rows = reportRows(s, sessionId); DayOfWeek today = LocalDate.now().getDayOfWeek();
        Set<Long> classesToday = rows.stream().filter(row -> row.dayOfWeek() == today).map(ReportRow::classId).collect(Collectors.toSet());
        Set<Long> teachersToday = rows.stream().filter(row -> row.dayOfWeek() == today).map(ReportRow::teacherId).filter(Objects::nonNull).collect(Collectors.toSet());
        long available = (long) configuredPeriodList(s, sessionId).size() * activeDays(s, sessionId).size() * timetables.stream().filter(t -> t.getStatus() != Timetable.Status.ARCHIVED).count();
        return new Dashboard(timetables.size(), timetables.stream().filter(t -> t.getStatus() == Timetable.Status.ACTIVE).count(), classesToday.size(), teachersToday.size(), Math.max(0, available - rows.size()), timetables.stream().filter(t -> t.getEffectiveFrom() != null && t.getEffectiveFrom().isAfter(LocalDate.now())).count(),
                countBy(rows, row -> row.dayOfWeek().name(), true, ReportRow::classId), countBy(rows.stream().filter(r -> r.teacherId() != null).toList(), ReportRow::teacherName, false, ReportRow::periodId), countBy(rows.stream().filter(r -> r.subjectId() != null).toList(), ReportRow::subjectName, false, ReportRow::periodId), countBy(rows, row -> row.dayOfWeek().name(), false, ReportRow::periodId));
    }

    private void validatePeriod(Long s, Long id, PeriodRequest request) {
        session(s, request.academicSessionId());
        if (!request.endTime().isAfter(request.startTime())) throw new IllegalArgumentException("Period end time must be after start time");
        if (request.type() == TimetablePeriod.Type.TEACHING_PERIOD && (request.periodNumber() == null || request.periodNumber() <= 0)) throw new IllegalArgumentException("Teaching periods require a positive period number");
        if (request.periodNumber() != null && request.periodNumber() <= 0) throw new IllegalArgumentException("Period number must be positive");
        boolean duplicateNumber = request.periodNumber() != null && (id == null ? periodRepository.existsBySchoolIdAndAcademicSessionIdAndPeriodNumberAndDeletedFalse(s, request.academicSessionId(), request.periodNumber()) : periodRepository.existsBySchoolIdAndAcademicSessionIdAndPeriodNumberAndIdNotAndDeletedFalse(s, request.academicSessionId(), request.periodNumber(), id));
        if (duplicateNumber) throw new IllegalArgumentException("Period number already exists in this academic session");
        boolean duplicateIdentity = id == null ? periodRepository.existsBySchoolIdAndAcademicSessionIdAndNameIgnoreCaseAndStartTimeAndEndTimeAndDeletedFalse(s, request.academicSessionId(), request.name().trim(), request.startTime(), request.endTime()) : periodRepository.existsBySchoolIdAndAcademicSessionIdAndNameIgnoreCaseAndStartTimeAndEndTimeAndIdNotAndDeletedFalse(s, request.academicSessionId(), request.name().trim(), request.startTime(), request.endTime(), id);
        if (duplicateIdentity) throw new IllegalArgumentException("Period name and time already exist in this academic session");
        boolean active = request.active() == null || request.active();
        if (active) for (TimetablePeriod other : configuredPeriodList(s, request.academicSessionId())) if (!Objects.equals(other.getId(), id) && overlaps(request.startTime(), request.endTime(), other.getStartTime(), other.getEndTime())) throw new IllegalArgumentException("Active periods cannot overlap: " + other.getName());
    }

    private void validateCells(Long s, GridRequest request, Map<Long, TimetablePeriod> periods, Set<DayOfWeek> days) {
        Set<String> cells = new HashSet<>();
        for (GridCellRequest cell : request.cells()) {
            if (!cells.add(cell.dayOfWeek() + ":" + cell.periodId())) throw new IllegalArgumentException("Duplicate timetable cell: " + cell.dayOfWeek() + "/" + cell.periodId());
            TimetablePeriod period = periods.get(cell.periodId()); if (period == null) throw new IllegalArgumentException("Period is not active in the academic session: " + cell.periodId());
            if (!days.contains(cell.dayOfWeek())) throw new IllegalArgumentException("Day is not a configured working day: " + cell.dayOfWeek());
            if (!period.isSubjectAllocatable()) { if (cell.subjectId() != null) throw new IllegalArgumentException(period.getType() + " periods cannot have a subject"); }
            else { if (cell.subjectId() == null) throw new IllegalArgumentException(period.getType() + " periods require a subject"); mapping(s, new CopyScope(request.academicSessionId(), request.classId(), request.sectionId()), cell.subjectId()); }
        }
    }

    private List<TimetableEntry> entriesFor(Long s, Timetable timetable, List<GridCellRequest> cells, Map<Long, TimetablePeriod> periods) {
        List<TimetableEntry> result = new ArrayList<>(); List<Timetable> peers = timetableRepository.findBySchoolIdAndAcademicSessionIdAndStatusNotAndDeletedFalse(s, timetable.getAcademicSessionId(), Timetable.Status.ARCHIVED).stream().filter(item -> !item.getId().equals(timetable.getId())).toList(); List<TimetableEntry> occupied = peers.isEmpty() ? List.of() : entryRepository.findBySchoolIdAndTimetableIdInAndDeletedFalse(s, peers.stream().map(Timetable::getId).toList());
        for (GridCellRequest cell : cells) {
            TimetableEntry entry = new TimetableEntry(); entry.setSchoolId(s); entry.setTimetableId(timetable.getId()); entry.setPeriodId(cell.periodId()); entry.setDayOfWeek(cell.dayOfWeek()); entry.setRoom(text(cell.room())); entry.setRemarks(text(cell.remarks())); entry.setSubjectId(cell.subjectId());
            if (cell.subjectId() != null) entry.setTeacherId(mapping(s, new CopyScope(timetable.getAcademicSessionId(), timetable.getClassId(), timetable.getSectionId()), cell.subjectId()).getTeacherId());
            for (TimetableEntry other : occupied) if (other.getDayOfWeek() == cell.dayOfWeek() && other.getPeriodId().equals(cell.periodId())) {
                if (entry.getTeacherId() != null && entry.getTeacherId().equals(other.getTeacherId())) throw new IllegalArgumentException("Teacher is already scheduled on " + cell.dayOfWeek() + " for period " + periods.get(cell.periodId()).getName());
                if (entry.getRoom() != null && entry.getRoom().equalsIgnoreCase(Objects.toString(other.getRoom(), ""))) throw new IllegalArgumentException("Room is already scheduled on " + cell.dayOfWeek() + " for period " + periods.get(cell.periodId()).getName());
            }
            result.add(entry);
        }
        return result;
    }

    private List<ReportRow> reportRows(Long s, Long sessionId) {
        List<Timetable> timetables = timetableRepository.findBySchoolIdAndAcademicSessionIdAndStatusNotAndDeletedFalse(s, sessionId, Timetable.Status.ARCHIVED); if (timetables.isEmpty()) return List.of();
        Map<Long, Timetable> tables = timetables.stream().collect(Collectors.toMap(Timetable::getId, Function.identity())); Map<Long, TimetablePeriod> periods = configuredPeriodList(s, sessionId).stream().collect(Collectors.toMap(TimetablePeriod::getId, Function.identity()));
        Map<Long, Subject> subjects = subjectRepository.findAllById(entryRepository.findBySchoolIdAndTimetableIdInAndDeletedFalse(s, new ArrayList<>(tables.keySet())).stream().map(TimetableEntry::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet())).stream().filter(subject -> subject.getSchoolId().equals(s)).collect(Collectors.toMap(Subject::getId, Function.identity()));
        Map<Long, Teacher> teachers = teacherRepository.findAllById(entryRepository.findBySchoolIdAndTimetableIdInAndDeletedFalse(s, new ArrayList<>(tables.keySet())).stream().map(TimetableEntry::getTeacherId).filter(Objects::nonNull).collect(Collectors.toSet())).stream().filter(teacher -> teacher.getSchoolId().equals(s)).collect(Collectors.toMap(Teacher::getId, Function.identity()));
        return entryRepository.findBySchoolIdAndTimetableIdInAndDeletedFalse(s, new ArrayList<>(tables.keySet())).stream().map(entry -> { Timetable table = tables.get(entry.getTimetableId()); TimetablePeriod period = periods.get(entry.getPeriodId()); Subject subject = subjects.get(entry.getSubjectId()); Teacher teacher = teachers.get(entry.getTeacherId()); return new ReportRow(table.getId(), table.getName(), table.getClassId(), className(s, table.getClassId()), table.getSectionId(), sectionName(s, table.getSectionId()), entry.getDayOfWeek(), entry.getPeriodId(), period == null ? "" : period.getName(), period == null ? null : period.getPeriodNumber(), period == null ? null : period.getStartTime(), period == null ? null : period.getEndTime(), entry.getSubjectId(), subject == null ? null : subject.getSubjectName(), entry.getTeacherId(), teacher == null ? null : teacherName(teacher), entry.getRoom(), entry.getRemarks()); }).sorted(Comparator.comparing(ReportRow::dayOfWeek).thenComparing(ReportRow::startTime, Comparator.nullsLast(Comparator.naturalOrder())).thenComparing(ReportRow::className)).toList();
    }

    private TimetableResponse response(Long s, Timetable timetable) {
        AcademicYear year = session(s, timetable.getAcademicSessionId()); List<PeriodResponse> periods = configuredPeriodList(s, year.getId()).stream().map(this::periodResponse).toList(); Map<Long, Subject> subjects = new HashMap<>(); Map<Long, Teacher> teachers = new HashMap<>();
        List<EntryResponse> entries = entryRepository.findBySchoolIdAndTimetableIdAndDeletedFalse(s, timetable.getId()).stream().map(entry -> { Subject subject = entry.getSubjectId() == null ? null : subjects.computeIfAbsent(entry.getSubjectId(), id -> subjectRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElse(null)); Teacher teacher = entry.getTeacherId() == null ? null : teachers.computeIfAbsent(entry.getTeacherId(), id -> teacherRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElse(null)); return new EntryResponse(entry.getId(), entry.getPeriodId(), entry.getDayOfWeek(), entry.getSubjectId(), subject == null ? null : subject.getSubjectName(), entry.getTeacherId(), teacher == null ? null : teacherName(teacher), entry.getRoom(), entry.getRemarks()); }).sorted(Comparator.comparing(EntryResponse::dayOfWeek).thenComparing(entry -> periods.stream().filter(p -> p.id().equals(entry.periodId())).map(PeriodResponse::startTime).findFirst().orElse(LocalTime.MAX))).toList();
        return new TimetableResponse(timetable.getId(), year.getId(), year.getName(), timetable.getClassId(), className(s, timetable.getClassId()), timetable.getSectionId(), sectionName(s, timetable.getSectionId()), timetable.getName(), timetable.getStatus(), timetable.getEffectiveFrom(), timetable.getEffectiveTo(), activeDays(s, year.getId()).stream().sorted().toList(), periods, entries);
    }

    private ScheduleResponse schedule(String view, Long sessionId, List<ReportRow> rows, Long s, Long classId, Long sectionId, Long teacherId) {
        LocalDate today = LocalDate.now(), tomorrow = today.plusDays(1); List<ReportRow> todayRows = rows.stream().filter(row -> row.dayOfWeek() == today.getDayOfWeek()).toList(), tomorrowRows = rows.stream().filter(row -> row.dayOfWeek() == tomorrow.getDayOfWeek()).toList();
        Set<String> occupied = rows.stream().map(row -> row.dayOfWeek() + ":" + row.periodId()).collect(Collectors.toSet()); List<String> free = new ArrayList<>(); for (DayOfWeek day : activeDays(s, sessionId)) for (TimetablePeriod period : configuredPeriodList(s, sessionId)) if (!occupied.contains(day + ":" + period.getId())) free.add(day + " " + period.getName());
        return new ScheduleResponse(view, today, todayRows, tomorrowRows, rows, free);
    }

    private Map<String, Long> countBy(List<ReportRow> rows, Function<ReportRow, String> key, boolean distinct, Function<ReportRow, Long> value) { Map<String, Long> result = new LinkedHashMap<>(); rows.stream().collect(Collectors.groupingBy(key, LinkedHashMap::new, Collectors.toList())).forEach((name, group) -> result.put(name, distinct ? group.stream().map(value).distinct().count() : group.size())); return result; }
    private List<ReportRow> classSchedule(Long s, Long sessionId, Long classId, Long sectionId) { return reportRows(s, sessionId).stream().filter(row -> classId.equals(row.classId()) && sectionId.equals(row.sectionId())).toList(); }
    private List<ReportRow> currentTeacherRows(Long s, Long sessionId, List<ReportRow> rows) { Teacher teacher = currentTeacher(s); Set<String> mappings = teacherSubjectRepository.findBySchoolIdAndAcademicSessionIdAndTeacherIdAndDeletedFalse(s, sessionId, teacher.getId()).stream().map(mapping -> mapping.getClassId() + ":" + mapping.getSectionId() + ":" + mapping.getSubjectId()).collect(Collectors.toSet()); return rows.stream().filter(row -> teacher.getId().equals(row.teacherId()) && mappings.contains(row.classId() + ":" + row.sectionId() + ":" + row.subjectId())).toList(); }
    private TeacherSubject mapping(Long s, CopyScope scope, Long subjectId) { activeSubject(s, scope.classId(), subjectId); TeacherSubject mapping = teacherSubjectRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndSubjectId(s, scope.academicSessionId(), scope.classId(), scope.sectionId(), subjectId).filter(item -> !item.isDeleted()).orElseThrow(() -> new IllegalArgumentException("No active teacher mapping for subject " + subjectId + " in the exact academic session/class/section scope")); activeTeacher(s, mapping.getTeacherId()); return mapping; }
    private void validateScope(Long s, Long sessionId, Long classId, Long sectionId) { session(s, sessionId); classRepository.findByIdAndSchoolIdAndDeletedFalse(classId, s).orElseThrow(() -> new ResourceNotFoundException("Class not found")); Section section = sectionRepository.findByIdAndSchoolIdAndDeletedFalse(sectionId, s).orElseThrow(() -> new ResourceNotFoundException("Section not found")); if (!classId.equals(section.getClassId())) throw new IllegalArgumentException("Section does not belong to class"); }
    private Subject activeSubject(Long s, Long classId, Long id) { Subject subject = subjectRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElseThrow(() -> new IllegalArgumentException("Subject not found: " + id)); if (!classId.equals(subject.getClassId()) || !"ACTIVE".equalsIgnoreCase(subject.getStatus())) throw new IllegalArgumentException("Subject is not active for the selected class: " + id); return subject; }
    private Teacher activeTeacher(Long s, Long id) { Teacher teacher = teacherRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElseThrow(() -> new IllegalArgumentException("Mapped teacher not found")); requireActive(teacher.getStatus(), "Mapped teacher is not active"); return teacher; }
    private Map<Long, TimetablePeriod> configuredPeriods(Long s, Long sessionId) { List<TimetablePeriod> periods = configuredPeriodList(s, sessionId); if (periods.isEmpty()) throw new IllegalArgumentException("Configure active timetable periods before creating a grid"); return periods.stream().collect(Collectors.toMap(TimetablePeriod::getId, Function.identity())); }
    private Set<DayOfWeek> configuredDays(Long s, Long sessionId) { Set<DayOfWeek> days = activeDays(s, sessionId); if (days.isEmpty()) throw new IllegalArgumentException("Configure working days before creating a grid"); return days; }
    private List<TimetablePeriod> configuredPeriodList(Long s, Long sessionId) { return periodRepository.findBySchoolIdAndAcademicSessionIdAndDeletedFalseOrderByStartTimeAsc(s, sessionId).stream().filter(TimetablePeriod::isActive).toList(); }
    private Set<DayOfWeek> activeDays(Long s, Long sessionId) { return workingDayRepository.findBySchoolIdAndAcademicSessionIdAndDeletedFalseOrderByDayOfWeekAsc(s, sessionId).stream().filter(TimetableWorkingDay::isActive).map(TimetableWorkingDay::getDayOfWeek).collect(Collectors.toCollection(LinkedHashSet::new)); }
    private Timetable canonical(Long s, Long sessionId, Long classId, Long sectionId) { return timetableRepository.findFirstBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndStatusNotAndDeletedFalseOrderByUpdatedAtDesc(s, sessionId, classId, sectionId, Timetable.Status.ARCHIVED).orElseThrow(() -> new ResourceNotFoundException("Timetable not found")); }
    private void assertCanonical(Long s, Long sessionId, Long classId, Long sectionId) { if (!timetableRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndStatusNotAndDeletedFalse(s, sessionId, classId, sectionId, Timetable.Status.ARCHIVED).isEmpty()) throw new IllegalArgumentException("A non-archived timetable already exists for this class and section"); }
    private void assertNoOtherCanonical(Long s, Timetable timetable) { if (timetableRepository.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndStatusNotAndDeletedFalse(s, timetable.getAcademicSessionId(), timetable.getClassId(), timetable.getSectionId(), Timetable.Status.ARCHIVED).stream().anyMatch(other -> !other.getId().equals(timetable.getId()))) throw new IllegalArgumentException("Another non-archived timetable exists for this class and section"); }
    private Timetable timetable(Long s, Long id) { return timetableRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElseThrow(() -> new ResourceNotFoundException("Timetable not found")); }
    private TimetablePeriod period(Long s, Long id) { return periodRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElseThrow(() -> new ResourceNotFoundException("Timetable period not found")); }
    private AcademicYear session(Long s, Long id) { return academicYearRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).orElseThrow(() -> new ResourceNotFoundException("Academic session not found")); }
    private AcademicYear activeSession(Long s) { return academicYearRepository.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(s).orElseThrow(() -> new ResourceNotFoundException("No active academic session configured")); }
    private Long activeOrRequestedSession(Long s, Long requested) { return requested == null ? activeSession(s).getId() : session(s, requested).getId(); }
    private Teacher currentTeacher(Long s) { return teacherRepository.findBySchoolIdAndUserIdAndStatusIgnoreCaseAndDeletedFalse(s, security.currentUser().getId(), "ACTIVE").orElseThrow(() -> new ForbiddenException("Active teacher profile required")); }
    private void deleteTimetable(Long s, Timetable timetable) { timetable.setStatus(Timetable.Status.ARCHIVED); timetable.setDeleted(true); timetableRepository.save(timetable); }
    private void copyPeriod(TimetablePeriod period, PeriodRequest request) { period.setAcademicSessionId(request.academicSessionId()); period.setName(request.name().trim()); period.setPeriodNumber(request.periodNumber()); period.setStartTime(request.startTime()); period.setEndTime(request.endTime()); period.setType(request.type()); period.setActive(request.active() == null || request.active()); }
    private PeriodResponse periodResponse(TimetablePeriod period) { return new PeriodResponse(period.getId(), period.getAcademicSessionId(), period.getName(), period.getPeriodNumber(), period.getStartTime(), period.getEndTime(), period.getType(), period.isActive()); }
    private String periodKey(TimetablePeriod p) { return Objects.toString(p.getPeriodNumber(), "") + "|" + p.getType() + "|" + p.getStartTime() + "|" + p.getEndTime() + "|" + p.getName().trim().toLowerCase(); }
    private String defaultName(Long s, Long classId, Long sectionId) { return className(s, classId) + " - " + sectionName(s, sectionId); }
    private String className(Long s, Long id) { return classRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).map(SchoolClass::getName).orElse(""); }
    private String sectionName(Long s, Long id) { return sectionRepository.findByIdAndSchoolIdAndDeletedFalse(id, s).map(Section::getName).orElse(""); }
    private static String teacherName(Teacher t) { return (Objects.toString(t.getFirstName(), "") + " " + Objects.toString(t.getMiddleName(), "") + " " + Objects.toString(t.getLastName(), "")).replaceAll("\\s+", " ").trim(); }
    private static String studentName(Student s) { return (Objects.toString(s.getFirstName(), "") + " " + Objects.toString(s.getMiddleName(), "") + " " + Objects.toString(s.getLastName(), "")).replaceAll("\\s+", " ").trim(); }
    private static void requireActive(String status, String message) { if (!"ACTIVE".equalsIgnoreCase(status)) throw new ForbiddenException(message); }
    private void requireAdmin() { if (!security.hasRole(RoleName.SCHOOL_ADMIN)) throw new ForbiddenException("School administrator role required"); }
    private void requireStaff() { if (!security.hasRole(RoleName.TEACHER) && !security.hasRole(RoleName.SCHOOL_ADMIN) && !security.hasRole(RoleName.SUPER_ADMIN)) throw new ForbiddenException("Staff role required"); }
    private void requireRole(RoleName role) { if (!security.hasRole(role)) throw new ForbiddenException(role + " role required"); }
    private static void validateDates(LocalDate from, LocalDate to) { if (from != null && to != null && to.isBefore(from)) throw new IllegalArgumentException("Effective end date cannot precede start date"); }
    private static boolean overlaps(LocalTime a, LocalTime b, LocalTime c, LocalTime d) { return a.isBefore(d) && c.isBefore(b); }
    private static String text(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private static String csv(String value) { return "\"" + Objects.toString(value, "").replace("\"", "\"\"") + "\""; }

    private static byte[] simplePdf(List<String> lines) {
        List<List<String>> pages = new ArrayList<>(); for (int start = 0; start < lines.size(); start += 52) pages.add(lines.subList(start, Math.min(start + 52, lines.size()))); if (pages.isEmpty()) pages.add(List.of(""));
        StringBuilder kids = new StringBuilder(); for (int i = 0; i < pages.size(); i++) kids.append(4 + i * 2).append(" 0 R "); List<String> objects = new ArrayList<>(); objects.add("<< /Type /Catalog /Pages 2 0 R >>"); objects.add("<< /Type /Pages /Kids [" + kids + "] /Count " + pages.size() + " >>"); objects.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
        for (int i = 0; i < pages.size(); i++) { StringBuilder stream = new StringBuilder("BT /F1 9 Tf 35 800 Td 12 TL "); for (String line : pages.get(i)) stream.append('(').append(line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)").replaceAll("[^\\x20-\\x7E]", "?")).append(") Tj T* "); stream.append("ET"); int contentRef = 5 + i * 2; objects.add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents " + contentRef + " 0 R >>"); objects.add("<< /Length " + stream.length() + " >>\nstream\n" + stream + "\nendstream"); }
        ByteArrayOutputStream out = new ByteArrayOutputStream(); write(out, "%PDF-1.4\n"); List<Integer> offsets = new ArrayList<>(); for (int i = 0; i < objects.size(); i++) { offsets.add(out.size()); write(out, (i + 1) + " 0 obj\n" + objects.get(i) + "\nendobj\n"); } int xref = out.size(); write(out, "xref\n0 " + (objects.size() + 1) + "\n0000000000 65535 f \n"); for (int offset : offsets) write(out, String.format("%010d 00000 n \n", offset)); write(out, "trailer\n<< /Size " + (objects.size() + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n"); return out.toByteArray();
    }
    private static void write(ByteArrayOutputStream out, String value) { out.writeBytes(value.getBytes(StandardCharsets.US_ASCII)); }
}
