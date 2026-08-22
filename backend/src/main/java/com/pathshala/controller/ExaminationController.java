package com.pathshala.controller;

import com.pathshala.dto.ExaminationDtos.*;
import com.pathshala.dto.ExaminationDtos.ExamTypeRequest;
import com.pathshala.entity.*;
import com.pathshala.service.ExaminationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/examinations")
@RequiredArgsConstructor
public class ExaminationController {
    private final ExaminationService service;

    @GetMapping("/dashboard") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Dashboard dashboard(@RequestParam Long sessionId, @RequestParam(required = false) Long schoolId) { return service.dashboard(schoolId, sessionId); }
    @GetMapping @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Page<Exam> exams(@RequestParam(required = false) Long schoolId, @RequestParam(required = false) Long sessionId, @RequestParam(required = false) Long classId, @RequestParam(required = false) String status, @RequestParam(required = false) String search, Pageable pageable) { return service.exams(schoolId, sessionId, classId, status, search, pageable); }
    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Exam exam(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { return service.getExam(schoolId, id); }
    @PostMapping @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Exam create(@RequestParam(required = false) Long schoolId, @Valid @RequestBody ExamRequest request) { return service.createExam(schoolId, request); }
    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Exam update(@PathVariable Long id, @RequestParam(required = false) Long schoolId, @Valid @RequestBody ExamRequest request) { return service.updateExam(schoolId, id, request); }
    @GetMapping("/{examId}/classes") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<SchoolClass> classes(@PathVariable Long examId, @RequestParam(required = false) Long schoolId) { return service.examClasses(schoolId, examId); }
    @PutMapping("/{examId}/classes") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<SchoolClass> classes(@PathVariable Long examId, @RequestParam(required = false) Long schoolId, @Valid @RequestBody ExamClassAssignmentsRequest request) { return service.replaceExamClasses(schoolId, examId, request); }
    @PatchMapping("/{id}/status") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Exam status(@PathVariable Long id, @RequestParam String value, @RequestParam(required = false) Long schoolId) { return service.status(schoolId, id, value); }
    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public void delete(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { service.deleteExam(schoolId, id); }
    @PostMapping("/types") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ExamType type(@RequestParam(required = false) Long schoolId, @Valid @RequestBody ExamTypeRequest request) { return service.saveExamType(schoolId, request); }
    @PutMapping("/types/{id}") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ExamType updateType(@PathVariable Long id, @RequestParam(required = false) Long schoolId, @Valid @RequestBody ExamTypeRequest request) { return service.saveExamType(schoolId, new ExamTypeRequest(id, request.name(), request.description(), request.weightage(), request.active())); }
    @PatchMapping("/types/{id}/status") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ExamType typeStatus(@PathVariable Long id, @RequestParam boolean active, @RequestParam(required = false) Long schoolId) { return service.examTypeStatus(schoolId, id, active); }
    @GetMapping("/types") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<ExamType> types(@RequestParam(defaultValue = "false") boolean includeInactive, @RequestParam(required = false) Long schoolId) { return service.examTypes(schoolId, includeInactive); }
    @GetMapping("/subject-academic-config") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<SubjectAcademicConfigRow> subjectAcademicConfig(@RequestParam Long academicSessionId, @RequestParam Long classId,
                                                                @RequestParam(required = false) Long schoolId) {
        return service.subjectAcademicConfig(schoolId, academicSessionId, classId);
    }
    @PutMapping("/subject-academic-config") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<SubjectAcademicConfigRow> subjectAcademicConfig(@RequestParam(required = false) Long schoolId,
                                                                @Valid @RequestBody SubjectAcademicConfigBulkRequest request) {
        return service.replaceSubjectAcademicConfig(schoolId, request);
    }

    @GetMapping("/{examId}/routine") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<ExamSubject> routine(@PathVariable Long examId, @RequestParam(required = false) Long schoolId) { return service.routine(schoolId, examId); }
    @GetMapping("/{examId}/routine/export.pdf") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> routinePdf(@PathVariable Long examId, @RequestParam(required = false) Long schoolId) { return download(service.exportRoutinePdf(schoolId, examId), "exam-routine.pdf", MediaType.APPLICATION_PDF_VALUE); }
    @PostMapping("/routine") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ExamSubject createRoutine(@RequestParam(required = false) Long schoolId, @Valid @RequestBody RoutineRequest request) { return service.createRoutine(schoolId, request); }
    @PutMapping("/routine/{id}") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ExamSubject updateRoutine(@PathVariable Long id, @RequestParam(required = false) Long schoolId, @Valid @RequestBody RoutineRequest request) { return service.updateRoutine(schoolId, id, request); }
    @DeleteMapping("/routine/{id}") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public void deleteRoutine(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { service.deleteRoutine(schoolId, id); }

    @GetMapping("/grading-systems") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<GradingSystem> gradingSystems(@RequestParam Long sessionId, @RequestParam(required = false) Long schoolId) { return service.gradingSystems(schoolId, sessionId); }
    @PostMapping("/grading-systems") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public GradingSystem createSystem(@RequestParam(required = false) Long schoolId, @Valid @RequestBody GradingSystemRequest request) { return service.createGradingSystem(schoolId, request); }
    @PutMapping("/grading-systems/{id}") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public GradingSystem updateSystem(@PathVariable Long id, @RequestParam(required = false) Long schoolId, @Valid @RequestBody GradingSystemRequest request) { return service.updateGradingSystem(schoolId, id, request); }
    @DeleteMapping("/grading-systems/{id}") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public void deleteSystem(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { service.deleteGradingSystem(schoolId, id); }
    @GetMapping("/grading-systems/{id}/rules") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<GradeRule> rules(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { return service.rules(schoolId, id); }
    @PostMapping("/grading-systems/{id}/rules") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public GradeRule createRule(@PathVariable Long id, @RequestParam(required = false) Long schoolId, @Valid @RequestBody GradeRuleRequest request) { return service.saveRule(schoolId, id, null, request); }
    @PutMapping("/grading-systems/{id}/rules/{ruleId}") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public GradeRule updateRule(@PathVariable Long id, @PathVariable Long ruleId, @RequestParam(required = false) Long schoolId, @Valid @RequestBody GradeRuleRequest request) { return service.saveRule(schoolId, id, ruleId, request); }
    @DeleteMapping("/grading-systems/{id}/rules/{ruleId}") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public void deleteRule(@PathVariable Long id, @PathVariable Long ruleId, @RequestParam(required = false) Long schoolId) { service.deleteRule(schoolId, id, ruleId); }
    @PostMapping("/grading-systems/{id}/activate") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public GradingSystem activate(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { return service.activateGradingSystem(schoolId, id); }
    @PostMapping("/grading-systems/{id}/deactivate") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public GradingSystem deactivate(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { return service.deactivateGradingSystem(schoolId, id); }

    @GetMapping("/{examId}/marks/roster") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<RosterRow> roster(@PathVariable Long examId, @RequestParam Long classId, @RequestParam Long sectionId, @RequestParam Long subjectId, @RequestParam(required = false) Long teacherId, @RequestParam(required = false) Long schoolId) { return service.roster(schoolId, examId, classId, sectionId, subjectId, teacherId); }
    @PutMapping("/marks") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<Mark> marks(@RequestParam(required = false) Long schoolId, @Valid @RequestBody BulkMarksRequest request) { return service.bulkMarks(schoolId, request); }
    @GetMapping("/teachers/self/assignments") @PreAuthorize("hasRole('TEACHER')")
    public List<TeacherAssignment> selfAssignments() { return service.selfTeacherAssignments(); }
    @GetMapping("/teachers/self/marks") @PreAuthorize("hasRole('TEACHER')")
    public List<RosterRow> selfMarks(@RequestParam Long examSubjectId) { return service.selfTeacherRoster(examSubjectId); }
    @PostMapping("/teachers/self/marks/bulk") @PreAuthorize("hasRole('TEACHER')")
    public List<Mark> selfBulkMarks(@Valid @RequestBody BulkMarksRequest request) { return service.selfTeacherBulkMarks(request); }
    @PostMapping("/{id}/publish") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Exam publish(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { return service.publish(schoolId, id); }
    @PostMapping("/{id}/unpublish") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public Exam unpublish(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { return service.unpublish(schoolId, id); }
    @GetMapping("/{examId}/publication-scopes") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<PublicationScope> publicationScopes(@PathVariable Long examId, @RequestParam(required = false) Long schoolId) { return service.publicationScopes(schoolId, examId); }
    @PostMapping("/{examId}/publication-scopes/{classId}/{sectionId}/publish") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public PublicationScope publishScope(@PathVariable Long examId, @PathVariable Long classId, @PathVariable Long sectionId,
                                         @RequestParam(required = false) Long schoolId) { return service.publishScope(schoolId, examId, classId, sectionId); }
    @PostMapping("/{examId}/publication-scopes/{classId}/{sectionId}/unpublish") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public PublicationScope unpublishScope(@PathVariable Long examId, @PathVariable Long classId, @PathVariable Long sectionId,
                                           @RequestParam(required = false) Long schoolId) { return service.unpublishScope(schoolId, examId, classId, sectionId); }
    @GetMapping("/{examId}/student-results") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<Result> studentResults(@PathVariable Long examId, @RequestParam(required = false) Long classId,
                                       @RequestParam(required = false) Long sectionId, @RequestParam(required = false) Long schoolId) {
        return service.studentResults(schoolId, examId, classId, sectionId);
    }
    @GetMapping("/{examId}/results/{studentId}") @PreAuthorize("hasAnyRole('STUDENT','PARENT','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Result result(@PathVariable Long examId, @PathVariable Long studentId, @RequestParam(required = false) Long schoolId) { return service.result(schoolId, examId, studentId); }
    @GetMapping("/transcript/{studentId}") @PreAuthorize("hasAnyRole('STUDENT','PARENT','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<Result> transcript(@PathVariable Long studentId, @RequestParam Long sessionId, @RequestParam(required = false) Long schoolId) { return service.transcript(schoolId, studentId, sessionId); }
    @GetMapping("/students/self/results") @PreAuthorize("hasRole('STUDENT')")
    public List<Result> selfStudentResults() { return service.selfStudentResults(); }
    @GetMapping("/parents/self/children/results") @PreAuthorize("hasRole('PARENT')")
    public List<ChildResults> selfParentResults() { return service.selfParentChildrenResults(); }
    @GetMapping("/{id}/reports") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<ReportRow> report(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { return service.report(schoolId, id); }
    @GetMapping("/{id}/merit") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<Result> merit(@PathVariable Long id, @RequestParam(required = false) Long classId,
                              @RequestParam(required = false) Long sectionId, @RequestParam(required = false) Long schoolId) { return service.meritList(schoolId, id, classId, sectionId); }
    @GetMapping("/{id}/export.csv") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> csv(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { return download(service.exportCsv(schoolId, id), "exam-results.csv", "text/csv"); }
    @GetMapping("/{id}/export.xlsx") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> excel(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { return download(service.exportExcel(schoolId, id), "exam-results.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); }
    @GetMapping("/{id}/export.pdf") @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> pdf(@PathVariable Long id, @RequestParam(required = false) Long schoolId) { return download(service.exportPdf(schoolId, id), "exam-results.pdf", MediaType.APPLICATION_PDF_VALUE); }
    private ResponseEntity<byte[]> download(byte[] bytes, String filename, String type) { HttpHeaders headers=new HttpHeaders(); headers.setContentType(MediaType.parseMediaType(type)); headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build()); return ResponseEntity.ok().headers(headers).body(bytes); }
}
