package com.pathshala.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathshala.dto.AssignmentDtos.*;
import com.pathshala.entity.*;
import com.pathshala.exception.ForbiddenException;
import com.pathshala.exception.ResourceNotFoundException;
import com.pathshala.repository.Repositories.*;
import com.pathshala.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.math.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {
    private static final Map<String, String> ASSIGNMENT_MIME_TYPES = Map.of(
            "pdf", "application/pdf",
            "doc", "application/msword",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "png", "image/png",
            "zip", "application/zip");
    private static final Set<String> ACTIVE_MIME_TYPES = Set.of(
            "image/svg+xml", "text/html", "application/xhtml+xml", "application/javascript",
            "text/javascript", "application/xml", "text/xml");

    private final AssignmentRepository assignments;
    private final AssignmentSubmissionRepository submissions;
    private final AssignmentSectionRepository assignmentSections;
    private final AcademicYearRepository academicYears;
    private final SchoolClassRepository classes;
    private final SectionRepository sections;
    private final SubjectRepository subjects;
    private final TeacherRepository teachers;
    private final TeacherSubjectRepository teacherSubjects;
    private final StudentRepository students;
    private final ParentRepository parents;
    private final NotificationRepository notifications;
    private final ModuleAccessService modules;
    private final SecurityUtils security;
    private final FileStorageService storage;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<AssignmentResponse> list(Long requestedSchoolId, Long sessionId, Long classId, Long sectionId, Long subjectId,
            Long teacherId, Assignment.Status status, String search, Pageable pageable) {
        Long school = readSchool(requestedSchoolId); requireStaff();
        Specification<Assignment> spec = tenant(school);
        if (sessionId != null) spec = spec.and(eq("academicSessionId", sessionId));
        if (classId != null) spec = spec.and(eq("classId", classId));
        if (subjectId != null) spec = spec.and(eq("subjectId", subjectId));
        if (teacherId != null && !security.hasRole(RoleName.TEACHER)) spec = spec.and(eq("teacherId", teacherId));
        if (status != null) spec = spec.and(eq("status", status));
        if (search != null && !search.isBlank()) { String value = "%" + search.trim().toLowerCase() + "%"; spec = spec.and((r,q,b)->b.or(b.like(b.lower(r.get("title")),value),b.like(b.lower(r.get("description")),value))); }
        if (security.hasRole(RoleName.TEACHER)) {
            Set<Long> accessible = accessibleAssignmentIds(school, assignments.findAll(tenant(school)));
            spec = spec.and((r,q,b) -> accessible.isEmpty() ? b.disjunction() : r.get("id").in(accessible));
        }
        if (sectionId != null) {
            Set<Long> ids = assignmentSections.findBySchoolIdAndAssignmentIdInAndDeletedFalse(school,
                    assignments.findAll(spec).stream().map(Assignment::getId).toList()).stream().filter(x -> x.getSectionId().equals(sectionId)).map(AssignmentSection::getAssignmentId).collect(Collectors.toSet());
            spec = spec.and((r,q,b)->r.get("id").in(ids));
        }
        return assignments.findAll(spec, pageable).map(this::response);
    }

    @Transactional(readOnly = true)
    public AssignmentResponse get(Long requestedSchoolId, Long id) { Assignment a = find(readSchool(requestedSchoolId), id); requireCanView(a, null); return response(a); }

    @Transactional
    public AssignmentResponse create(Long requestedSchoolId, AssignmentRequest request) {
        Long school = writeSchool(requestedSchoolId); Assignment assignment = new Assignment(); assignment.setSchoolId(school);
        apply(assignment, request, school); return response(assignments.save(assignment));
    }

    @Transactional
    public AssignmentResponse update(Long requestedSchoolId, Long id, AssignmentRequest request) {
        Long school = writeSchool(requestedSchoolId); Assignment assignment = find(school, id); requireOwnerOrAdmin(assignment);
        boolean hasSubmissions = !submissions.findBySchoolIdAndAssignmentIdAndDeletedFalse(school, id).isEmpty();
        if (hasSubmissions && (!Objects.equals(assignment.getAcademicSessionId(), request.academicSessionId())
                || !Objects.equals(assignment.getClassId(), request.classId())
                || !Objects.equals(assignment.getSubjectId(), request.subjectId())
                || !new LinkedHashSet<>(sectionIds(assignment)).equals(new LinkedHashSet<>(request.sectionIds()))
                || !Objects.equals(assignment.getMaximumMarks(), request.maximumMarks())))
            throw new IllegalArgumentException("Structural assignment fields cannot be changed after submissions");
        apply(assignment, request, school); return response(assignments.save(assignment));
    }

    @Transactional
    public void delete(Long requestedSchoolId, Long id) {
        Long school = writeSchool(requestedSchoolId); Assignment assignment = find(school, id); requireOwnerOrAdmin(assignment);
        assignment.setDeleted(true); assignment.setStatus(Assignment.Status.ARCHIVED); assignments.save(assignment);
        assignmentSections.findBySchoolIdAndAssignmentIdAndDeletedFalse(school, id).forEach(x -> x.setDeleted(true));
    }

    @Transactional
    public AssignmentResponse publish(Long requestedSchoolId, Long id) {
        Long school = writeSchool(requestedSchoolId); Assignment assignment = find(school, id); requireOwnerOrAdmin(assignment);
        LocalDateTime now = LocalDateTime.now();
        boolean draft = assignment.getStatus() == Assignment.Status.DRAFT;
        boolean scheduled = assignment.getStatus() == Assignment.Status.PUBLISHED
                && assignment.getPublishAt() != null && assignment.getPublishAt().isAfter(now);
        if (!draft && !scheduled)
            throw new IllegalArgumentException("Only draft or scheduled assignments can be published");
        if (assignment.getPublishAt() == null) throw new IllegalArgumentException("publishAt is required");
        if (assignment.getDueAt() == null || !assignment.getDueAt().isAfter(now))
            throw new IllegalArgumentException("dueAt must be in the future");
        validateDates(assignment);
        assignment.setStatus(!assignment.getPublishAt().isAfter(now) ? Assignment.Status.ACTIVE : Assignment.Status.PUBLISHED);
        assignments.save(assignment);
        if (assignment.getStatus() == Assignment.Status.ACTIVE)
            notifyAudience(assignment, "ASSIGNMENT_PUBLISHED", "New assignment: " + assignment.getTitle());
        return response(assignment);
    }

    @Transactional
    public AssignmentResponse reopen(Long requestedSchoolId, Long id, LocalDateTime dueAt) {
        Long school = writeSchool(requestedSchoolId); Assignment assignment = find(school, id);
        if (!security.hasRole(RoleName.SCHOOL_ADMIN)) throw new ForbiddenException("Only a school administrator may reopen assignments");
        if (assignment.getStatus() != Assignment.Status.CLOSED) throw new IllegalArgumentException("Only closed assignments can be reopened");
        if (dueAt == null || !dueAt.isAfter(LocalDateTime.now())) throw new IllegalArgumentException("dueAt must be in the future");
        assignment.setDueAt(dueAt); assignment.setStatus(Assignment.Status.ACTIVE);
        if (assignment.isAllowLateSubmission() && (assignment.getLateSubmissionDeadline() == null || !assignment.getLateSubmissionDeadline().isAfter(dueAt))) { assignment.setAllowLateSubmission(false); assignment.setLateSubmissionDeadline(null); }
        validateDates(assignment);
        return response(assignments.save(assignment));
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> teacherSelf() {
        Long school = security.requiredSchoolId(); modules.require(school, ModuleCode.ASSIGNMENT); Teacher teacher = currentTeacher(school);
        Set<Long> accessible = accessibleAssignmentIds(school, assignments.findAll(tenant(school)));
        return assignments.findAll(tenant(school)).stream().filter(a -> accessible.contains(a.getId()))
                .sorted(Comparator.comparing(Assignment::getDueAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentScope> teacherLookups() {
        Long school = security.requiredSchoolId(); modules.require(school, ModuleCode.ASSIGNMENT);
        Teacher teacher = currentTeacher(school);
        return teacherSubjects.findBySchoolIdAndTeacherIdAndDeletedFalse(school, teacher.getId()).stream()
                .map(scope -> {
                    AcademicYear session = scope.getAcademicSessionId() == null ? null : academicYears.findByIdAndSchoolIdAndDeletedFalse(scope.getAcademicSessionId(), school).orElse(null);
                    SchoolClass schoolClass = classes.findByIdAndSchoolIdAndDeletedFalse(scope.getClassId(), school).orElse(null);
                    Section section = sections.findByIdAndSchoolIdAndDeletedFalse(scope.getSectionId(), school).orElse(null);
                    Subject subject = subjects.findByIdAndSchoolIdAndDeletedFalse(scope.getSubjectId(), school).orElse(null);
                    if (session == null || schoolClass == null || section == null || subject == null) return null;
                    return new TeacherAssignmentScope(session.getId(), session.getName(), schoolClass.getId(), schoolClass.getName(), section.getId(),
                            section.getName(), subject.getId(), subject.getSubjectName());
                }).filter(Objects::nonNull)
                .sorted(Comparator.comparing(TeacherAssignmentScope::academicSessionName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(TeacherAssignmentScope::className, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(TeacherAssignmentScope::sectionName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(TeacherAssignmentScope::subjectName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RosterRow> roster(Long requestedSchoolId, Long assignmentId) {
        Long school = readSchool(requestedSchoolId); Assignment assignment = find(school, assignmentId); requireCanView(assignment, null);
        Map<Long, AssignmentSubmission> saved = submissions.findBySchoolIdAndAssignmentIdAndDeletedFalse(school, assignmentId).stream().collect(Collectors.toMap(AssignmentSubmission::getStudentId, x->x,(a,b)->b));
        Set<Long> target = audienceSectionsForCaller(assignment);
        return students.findBySchoolIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(school, "ACTIVE").stream()
                .filter(s -> s.getClassId().equals(assignment.getClassId()) && target.contains(s.getSectionId()))
                .map(s -> new RosterRow(s.getId(), name(s), s.getAdmissionNumber(), s.getRollNumber(), submission(saved.get(s.getId()), assignmentId, s.getId()))).toList();
    }

    @Transactional
    public SubmissionResponse review(Long requestedSchoolId, Long assignmentId, Long submissionId, ReviewRequest request) {
        Long school = writeSchool(requestedSchoolId); Assignment assignment = find(school, assignmentId); requireCanView(assignment, null);
        AssignmentSubmission submission = submissions.findByIdAndSchoolIdAndDeletedFalse(submissionId, school).orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        if (!submission.getAssignmentId().equals(assignmentId)) throw new IllegalArgumentException("Submission does not belong to assignment");
        requireSubmissionAudience(assignment, submission.getStudentId());
        applyReview(assignment, submission, request); notifyStudent(submission.getStudentId(), school, request.status()==AssignmentSubmission.Status.GRADED?"ASSIGNMENT_GRADED":"ASSIGNMENT_REVIEWED", assignment);
        return submission(submissions.save(submission), assignmentId, submission.getStudentId());
    }

    @Transactional
    public List<SubmissionResponse> bulkReview(Long schoolId, Long assignmentId, BulkReviewRequest request) {
        Long school = writeSchool(schoolId); Assignment assignment = find(school, assignmentId); requireCanView(assignment, null);
        List<SubmissionResponse> reviewed = new ArrayList<>();
        for (BulkReviewItem item : request.reviews()) {
            AssignmentSubmission row = submissions.findByIdAndSchoolIdAndDeletedFalse(item.submissionId(), school)
                    .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
            if (!row.getAssignmentId().equals(assignmentId)) throw new IllegalArgumentException("Submission does not belong to assignment");
            requireSubmissionAudience(assignment, row.getStudentId());
            applyReview(assignment, row, item.review());
            submissions.save(row);
            notifyStudent(row.getStudentId(), school, item.review().status()==AssignmentSubmission.Status.GRADED?"ASSIGNMENT_GRADED":"ASSIGNMENT_REVIEWED", assignment);
            reviewed.add(submission(row, assignmentId, row.getStudentId()));
        }
        return reviewed;
    }

    @Transactional(readOnly = true)
    public List<StudentAssignment> studentSelf() { return studentAssignments(currentStudent()); }

    @Transactional(readOnly = true)
    public StudentAssignment studentDetail(Long id) {
        Student student=currentStudent(); Assignment a=find(student.getSchoolId(),id); requireStudentAssignment(a,student);
        AssignmentSubmission own=submissions.findBySchoolIdAndAssignmentIdAndStudentIdAndDeletedFalse(student.getSchoolId(),id,student.getId()).orElse(null);
        return new StudentAssignment(response(a),submission(own,id,student.getId()));
    }

    @Transactional
    public SubmissionResponse submitSelf(Long assignmentId, SubmissionRequest request, List<MultipartFile> files) {
        Student student = currentStudent(); Assignment assignment = find(student.getSchoolId(), assignmentId); requireStudentAssignment(assignment, student);
        LocalDateTime now=LocalDateTime.now(); boolean late=now.isAfter(assignment.getDueAt());
        if (late && (!assignment.isAllowLateSubmission() || assignment.getLateSubmissionDeadline()==null || now.isAfter(assignment.getLateSubmissionDeadline()))) throw new IllegalArgumentException("Assignment submission deadline has passed");
        AssignmentSubmission row=submissions.findBySchoolIdAndAssignmentIdAndStudentIdAndDeletedFalse(student.getSchoolId(),assignmentId,student.getId()).orElseGet(()->{ AssignmentSubmission x=new AssignmentSubmission(); x.setSchoolId(student.getSchoolId()); x.setAssignmentId(assignmentId); x.setStudentId(student.getId()); return x; });
        if (row.getId()!=null && row.getStatus()!=AssignmentSubmission.Status.PENDING && row.getStatus()!=AssignmentSubmission.Status.RETURNED && row.getStatus()!=AssignmentSubmission.Status.SUBMITTED && row.getStatus()!=AssignmentSubmission.Status.LATE) throw new IllegalArgumentException("Only pending, submitted, late, or returned work can be submitted or replaced");
        row.setAnswerText(clean(request == null ? null : request.answerText())); row.setComments(clean(request == null ? null : request.comments())); row.setSubmittedAt(now); row.setStatus(late?AssignmentSubmission.Status.LATE:AssignmentSubmission.Status.SUBMITTED); row.setMarks(null); row.setPercentage(null); row.setFeedback(null); row.setReviewedAt(null); row.setReviewedBy(null);
        if (files!=null && !files.isEmpty()) { validateAssignmentFiles(files); row.setAttachmentMetadata(json(files.stream().map(f->storeAssignmentFile(student.getSchoolId(),assignmentId,"submissions/"+student.getId(),f)).toList())); }
        return submission(submissions.save(row), assignmentId, student.getId());
    }

    @Transactional(readOnly = true)
    public List<ChildAssignments> parentChildren() {
        Long school=security.requiredSchoolId(); modules.require(school,ModuleCode.ASSIGNMENT); Parent parent=parents.findBySchoolIdAndUserIdAndDeletedFalse(school,security.currentUser().getId()).orElseThrow(()->new ForbiddenException("Parent profile required"));
        return students.findBySchoolIdAndParentIdAndDeletedFalse(school,parent.getId()).stream().map(s->new ChildAssignments(s.getId(),name(s),studentAssignments(s))).toList();
    }

    @Transactional(readOnly = true)
    public Dashboard dashboard(Long requestedSchoolId) {
        Long school=readSchool(requestedSchoolId); requireStaff(); List<Assignment> list=assignments.findAll(tenant(school));
        if(security.hasRole(RoleName.TEACHER)){Set<Long> accessible=accessibleAssignmentIds(school,list);list=list.stream().filter(a->accessible.contains(a.getId())).toList();}
        LocalDateTime now=LocalDateTime.now(); LocalDate today=now.toLocalDate();
        long active=count(list,a->effectiveStatus(a,now)==Assignment.Status.ACTIVE);
        long dueToday=count(list,a->a.getDueAt()!=null&&a.getDueAt().toLocalDate().equals(today)&&effectiveStatus(a,now)!=Assignment.Status.DRAFT&&effectiveStatus(a,now)!=Assignment.Status.ARCHIVED);
        long overdue=count(list,a->a.getDueAt()!=null&&a.getDueAt().isBefore(now)&&effectiveStatus(a,now)!=Assignment.Status.DRAFT&&effectiveStatus(a,now)!=Assignment.Status.ARCHIVED);
        List<Student> activeStudents=students.findBySchoolIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(school,"ACTIVE");
        long expected=0,pending=0,submitted=0,reviewed=0; Map<String,Long> submissionStatus=new LinkedHashMap<>();
        for(AssignmentSubmission.Status status:AssignmentSubmission.Status.values())submissionStatus.put(status.name(),0L);
        List<Assignment> measurable=list.stream().filter(a->visible(a)).toList();
        for(Assignment assignment:measurable){
            Set<Long> targetSections=audienceSectionsForCaller(assignment);
            Set<Long> targetStudents=activeStudents.stream().filter(s->assignment.getClassId().equals(s.getClassId())&&targetSections.contains(s.getSectionId())).map(Student::getId).collect(Collectors.toSet());
            Map<Long,AssignmentSubmission> saved=submissions.findBySchoolIdAndAssignmentIdAndDeletedFalse(school,assignment.getId()).stream().filter(s->targetStudents.contains(s.getStudentId())).collect(Collectors.toMap(AssignmentSubmission::getStudentId,s->s,(a,b)->b));
            expected+=targetStudents.size();
            for(Long studentId:targetStudents){AssignmentSubmission row=saved.get(studentId);if(row==null||row.getStatus()==AssignmentSubmission.Status.PENDING){pending++;submissionStatus.merge(AssignmentSubmission.Status.PENDING.name(),1L,Long::sum);continue;}submissionStatus.merge(row.getStatus().name(),1L,Long::sum);if(isSubmitted(row.getStatus()))submitted++;if(isReviewed(row.getStatus()))reviewed++;}
        }
        BigDecimal average=expected==0?BigDecimal.ZERO:BigDecimal.valueOf(submitted).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(expected),2,RoundingMode.HALF_UP);
        Map<String,Long> monthly=list.stream().filter(a->a.getCreatedAt()!=null).collect(Collectors.groupingBy(a->YearMonth.from(LocalDateTime.ofInstant(a.getCreatedAt(),ZoneOffset.UTC)).toString(),TreeMap::new,Collectors.counting()));
        return new Dashboard(list.size(),active,dueToday,overdue,pending,submitted,reviewed,average,submissionStatus,group(list,a->String.valueOf(a.getSubjectId())),group(list,a->String.valueOf(a.getClassId())),monthly);
    }

    @Transactional(readOnly = true)
    public long dashboardPendingSubmissions(Long requestedSchoolId, Long sessionId, LocalDate date) {
        Long school = readSchool(requestedSchoolId);
        requireStaff();
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        List<Assignment> active = assignments.findBySchoolIdAndAcademicSessionIdAndDeletedFalseOrderByDueAtAsc(school, sessionId)
                .stream().filter(a -> dashboardActive(a, start, end)).toList();
        return pendingForDashboardAssignments(school, active);
    }

    @Transactional(readOnly = true)
    public List<ReportRow> report(Long requestedSchoolId, String type, Long sessionId, Long studentId, Long teacherId, Long subjectId) {
        Long school=readSchool(requestedSchoolId); requireStaff(); List<Assignment> list=assignments.findAll(tenant(school)).stream().filter(this::visible).toList();
        if(sessionId!=null) list=list.stream().filter(a->a.getAcademicSessionId().equals(sessionId)).toList(); if(teacherId!=null&&!security.hasRole(RoleName.TEACHER)) list=list.stream().filter(a->a.getTeacherId()!=null&&a.getTeacherId().equals(teacherId)).toList(); if(subjectId!=null) list=list.stream().filter(a->a.getSubjectId().equals(subjectId)).toList();
        if(security.hasRole(RoleName.TEACHER)){Set<Long> accessible=accessibleAssignmentIds(school,list);list=list.stream().filter(a->accessible.contains(a.getId())).toList();}
        List<ReportRow> rows=new ArrayList<>(); for(Assignment a:list) for(RosterRow r:rosterInternal(school,a)){ SubmissionResponse s=r.submission(); rows.add(new ReportRow(a.getId(),a.getTitle(),a.getTeacherId(),a.getSubjectId(),r.studentId(),r.studentName(),s.status(),s.submittedAt(),s.marks(),s.percentage())); }
        if(studentId!=null) rows=rows.stream().filter(r->r.studentId().equals(studentId)).toList();
        String reportType=Objects.toString(type,"completion").trim().toLowerCase(Locale.ROOT).replace('_','-');
        Comparator<ReportRow> byAssignment=Comparator.comparing(ReportRow::assignmentTitle,String.CASE_INSENSITIVE_ORDER).thenComparing(ReportRow::studentName,String.CASE_INSENSITIVE_ORDER);
        return switch(reportType){
            case "completion" -> rows.stream().sorted(Comparator.comparing((ReportRow r)->r.status()!=AssignmentSubmission.Status.PENDING).thenComparing(byAssignment)).toList();
            case "student", "performance", "student-performance" -> rows.stream().filter(r->r.status()==AssignmentSubmission.Status.GRADED).sorted(Comparator.comparing(ReportRow::studentName,String.CASE_INSENSITIVE_ORDER).thenComparing(ReportRow::percentage,Comparator.nullsLast(Comparator.reverseOrder()))).toList();
            case "teacher", "teacher-workload" -> rows.stream().sorted(Comparator.comparing(ReportRow::teacherId,Comparator.nullsLast(Comparator.naturalOrder())).thenComparing(byAssignment)).toList();
            case "subject", "subject-performance" -> rows.stream().filter(r->r.status()==AssignmentSubmission.Status.GRADED).sorted(Comparator.comparing(ReportRow::subjectId).thenComparing(ReportRow::percentage,Comparator.nullsLast(Comparator.reverseOrder()))).toList();
            case "late" -> rows.stream().filter(r->r.status()==AssignmentSubmission.Status.LATE).sorted(Comparator.comparing(ReportRow::submittedAt,Comparator.nullsLast(Comparator.reverseOrder()))).toList();
            default -> throw new IllegalArgumentException("Report type must be completion, student-performance, teacher-workload, subject-performance, or late");
        };
    }

    public byte[] export(Long schoolId,String type,String format,Long sessionId,Long studentId,Long teacherId,Long subjectId){List<ReportRow> rows=report(schoolId,type,sessionId,studentId,teacherId,subjectId);return switch(format.toLowerCase()){case "csv"->csv(rows);case "xlsx"->xlsx(rows);case "pdf"->pdf(rows);default->throw new IllegalArgumentException("Format must be csv, xlsx, or pdf");};}

    @Transactional
    public AssignmentResponse uploadAssignmentFiles(Long schoolId,Long id,List<MultipartFile> files){Long school=writeSchool(schoolId);Assignment a=find(school,id);requireOwnerOrAdmin(a);validateAssignmentFiles(files);List<Attachment> all=new ArrayList<>(attachments(a.getAttachmentMetadata()));all.addAll(files.stream().map(f->storeAssignmentFile(school,id,"assignment",f)).toList());a.setAttachmentMetadata(json(all));return response(assignments.save(a));}
    @Transactional
    public SubmissionResponse uploadSubmissionFiles(Long id,SubmissionRequest request,List<MultipartFile> files){validateAssignmentFiles(files);return submitSelf(id,request,files);}
    @Transactional(readOnly=true)
    public FileStorageService.StoredFile downloadAssignment(Long schoolId,Long id,String key){Assignment a=find(readSchool(schoolId),id);requireCanView(a,null);return loadAssignmentFile(findAttachment(a.getAttachmentMetadata(),key));}
    @Transactional(readOnly=true)
    public FileStorageService.StoredFile downloadSubmission(Long schoolId,Long assignmentId,Long submissionId,String key){Long school=readSchool(schoolId);Assignment a=find(school,assignmentId);AssignmentSubmission s=submissions.findByIdAndSchoolIdAndDeletedFalse(submissionId,school).orElseThrow(()->new ResourceNotFoundException("Submission not found"));if(!s.getAssignmentId().equals(assignmentId))throw new IllegalArgumentException("Submission does not belong to assignment");requireCanView(a,s.getStudentId());requireSubmissionAudience(a,s.getStudentId());return loadAssignmentFile(findAttachment(s.getAttachmentMetadata(),key));}

    @Transactional
    public AssignmentResponse legacyCreate(com.pathshala.dto.ApiDtos.AssignmentRequest r){Long school=writeSchool(null);AcademicYear y=academicYears.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(school).orElseThrow(()->new IllegalArgumentException("No active academic session"));return create(null,new AssignmentRequest(y.getId(),r.classId(),List.of(r.sectionId()),r.subjectId(),r.title(),Assignment.Category.HOMEWORK,r.description(),r.description(),LocalDateTime.now(),r.dueAt(),null,false,null));}
    @Transactional
    public SubmissionResponse legacySubmit(com.pathshala.dto.ApiDtos.SubmissionRequest r){if(r.fileUrl()!=null&&!r.fileUrl().isBlank())throw new IllegalArgumentException("Trusted file URLs are not accepted; use the authenticated multipart endpoint");return submitSelf(r.assignmentId(),new SubmissionRequest(r.answerText(),null),List.of());}

    @Transactional
    public void sendDueReminder(Assignment a){if(a.getReminderSentAt()!=null)return;notifyAudience(a,"ASSIGNMENT_DUE_TOMORROW","Assignment due tomorrow: "+a.getTitle());a.setReminderSentAt(LocalDateTime.now());assignments.save(a);}
    @Transactional(readOnly=true)
    public List<Assignment> dueForReminder(LocalDateTime from,LocalDateTime to){return assignments.findByStatusInAndDueAtBetweenAndReminderSentAtIsNullAndDeletedFalse(List.of(Assignment.Status.PUBLISHED,Assignment.Status.ACTIVE),from,to);}
    @Transactional
    public void closeOverdue(){for(Assignment a:assignments.findByStatusInAndDueAtBeforeAndDeletedFalse(List.of(Assignment.Status.PUBLISHED,Assignment.Status.ACTIVE),LocalDateTime.now())){if(a.isAllowLateSubmission()&&a.getLateSubmissionDeadline()!=null&&a.getLateSubmissionDeadline().isAfter(LocalDateTime.now()))continue;notifyAudience(a,"ASSIGNMENT_OVERDUE","Assignment overdue: "+a.getTitle());a.setStatus(Assignment.Status.CLOSED);assignments.save(a);}}

    @Transactional
    public void activateScheduledAssignments(){
        for(Assignment a:assignments.findByStatusAndPublishAtLessThanEqualAndDeletedFalse(Assignment.Status.PUBLISHED,LocalDateTime.now())){
            notifyAudience(a,"ASSIGNMENT_PUBLISHED","New assignment: "+a.getTitle());
            a.setStatus(Assignment.Status.ACTIVE);
            assignments.save(a);
        }
    }

    @Transactional(readOnly=true)
    public long teacherPendingAssignments(){
        Long school=security.requiredSchoolId(); modules.require(school,ModuleCode.ASSIGNMENT);
        List<Assignment> source=assignments.findAll(tenant(school)); Set<Long> accessible=accessibleAssignmentIds(school,source);
        return pendingForAssignments(school,source.stream().filter(a->accessible.contains(a.getId())).toList());
    }

    @Transactional(readOnly=true)
    public long studentPendingAssignments(){return pendingForStudent(currentStudent());}

    @Transactional(readOnly=true)
    public long parentPendingAssignments(){
        Long school=security.requiredSchoolId(); modules.require(school,ModuleCode.ASSIGNMENT);
        Parent parent=parents.findBySchoolIdAndUserIdAndDeletedFalse(school,security.currentUser().getId()).orElseThrow(()->new ForbiddenException("Parent profile required"));
        return students.findBySchoolIdAndParentIdAndDeletedFalse(school,parent.getId()).stream().mapToLong(this::pendingForStudent).sum();
    }

    private void apply(Assignment a,AssignmentRequest r,Long school){requireStaff();academicYears.findByIdAndSchoolIdAndDeletedFalse(r.academicSessionId(),school).orElseThrow(()->new IllegalArgumentException("Academic session not found"));classes.findByIdAndSchoolIdAndDeletedFalse(r.classId(),school).orElseThrow(()->new IllegalArgumentException("Class not found"));Subject subject=subjects.findByIdAndSchoolIdAndDeletedFalse(r.subjectId(),school).orElseThrow(()->new IllegalArgumentException("Subject not found"));if(!"ACTIVE".equalsIgnoreCase(subject.getStatus()))throw new IllegalArgumentException("Subject must be active");if(!r.classId().equals(subject.getClassId()))throw new IllegalArgumentException("Subject does not belong to class");List<Long> sectionIds=r.sectionIds().stream().distinct().toList();Set<Long> mappedTeachers=new LinkedHashSet<>();for(Long sectionId:sectionIds){Section section=sections.findByIdAndSchoolIdAndDeletedFalse(sectionId,school).orElseThrow(()->new IllegalArgumentException("Section not found"));if(!section.getClassId().equals(r.classId()))throw new IllegalArgumentException("Section does not belong to class");TeacherSubject mapping=teacherSubjects.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndSubjectId(school,r.academicSessionId(),r.classId(),sectionId,r.subjectId()).filter(x->!x.isDeleted()).orElseThrow(()->new ForbiddenException("No active teacher mapping exists for the exact assignment scope"));if(mapping.getTeacherId()==null)throw new ForbiddenException("Teacher mapping must reference an active teacher");Teacher mappedTeacher=teachers.findByIdAndSchoolIdAndDeletedFalse(mapping.getTeacherId(),school).filter(t->"ACTIVE".equalsIgnoreCase(t.getStatus())).orElseThrow(()->new ForbiddenException("Teacher mapping must reference an active teacher"));mappedTeachers.add(mappedTeacher.getId());}
        if(security.hasRole(RoleName.TEACHER)){Long teacherId=currentTeacher(school).getId();if(mappedTeachers.stream().anyMatch(id->!id.equals(teacherId)))throw new ForbiddenException("Teacher is not assigned to every selected section");}
        a.setAcademicSessionId(r.academicSessionId());a.setTeacherId(mappedTeachers.size()==1?mappedTeachers.iterator().next():null);a.setClassId(r.classId());a.setSectionId(sectionIds.getFirst());a.setSubjectId(r.subjectId());a.setTitle(r.title().trim());a.setCategory(r.category()==null?Assignment.Category.HOMEWORK:r.category());a.setDescription(clean(r.description()));a.setInstructions(clean(r.instructions()));a.setPublishAt(r.publishAt());a.setDueAt(r.dueAt());a.setMaximumMarks(r.maximumMarks());a.setAllowLateSubmission(r.allowLateSubmission());a.setLateSubmissionDeadline(r.lateSubmissionDeadline());validateDates(a);a=assignments.save(a);replaceSections(a,sectionIds);
    }
    private void replaceSections(Assignment a,List<Long> ids){Map<Long,AssignmentSection> existing=assignmentSections.findBySchoolIdAndAssignmentId(a.getSchoolId(),a.getId()).stream().collect(Collectors.toMap(AssignmentSection::getSectionId,x->x,(x,y)->y));existing.values().forEach(x->x.setDeleted(!ids.contains(x.getSectionId())));assignmentSections.saveAll(existing.values());for(Long id:ids){AssignmentSection x=existing.get(id);if(x!=null){x.setDeleted(false);assignmentSections.save(x);}else{x=new AssignmentSection();x.setSchoolId(a.getSchoolId());x.setAssignmentId(a.getId());x.setSectionId(id);assignmentSections.save(x);}}}
    private void validateDates(Assignment a){if(a.getPublishAt()!=null&&a.getPublishAt().isAfter(a.getDueAt()))throw new IllegalArgumentException("publishAt must be before or equal to dueAt");if(a.isAllowLateSubmission()&&(a.getLateSubmissionDeadline()==null||!a.getLateSubmissionDeadline().isAfter(a.getDueAt())))throw new IllegalArgumentException("Late submission deadline must be after dueAt");if(!a.isAllowLateSubmission()&&a.getLateSubmissionDeadline()!=null)throw new IllegalArgumentException("lateSubmissionDeadline requires allowLateSubmission");}
    private void applyReview(Assignment a,AssignmentSubmission s,ReviewRequest r){if(r.status()!=AssignmentSubmission.Status.REVIEWED&&r.status()!=AssignmentSubmission.Status.RETURNED&&r.status()!=AssignmentSubmission.Status.GRADED)throw new IllegalArgumentException("Review status must be REVIEWED, RETURNED, or GRADED");if(r.marks()!=null&&(a.getMaximumMarks()==null||r.marks().compareTo(a.getMaximumMarks())>0))throw new IllegalArgumentException("Marks cannot exceed maximum marks");if(r.status()==AssignmentSubmission.Status.GRADED&&r.marks()==null)throw new IllegalArgumentException("Marks are required when grading");s.setMarks(r.marks());s.setPercentage(r.marks()==null||a.getMaximumMarks()==null?null:r.marks().multiply(BigDecimal.valueOf(100)).divide(a.getMaximumMarks(),2,RoundingMode.HALF_UP));s.setFeedback(clean(r.feedback()));s.setStatus(r.status());s.setReviewedBy(security.currentUser().getId());s.setReviewedAt(LocalDateTime.now());}
    private List<Assignment> visibleForStudent(Student s){modules.require(s.getSchoolId(),ModuleCode.ASSIGNMENT);Long active=academicYears.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(s.getSchoolId()).map(AcademicYear::getId).orElse(null);return assignments.findAll(tenant(s.getSchoolId())).stream().filter(this::visible).filter(a->Objects.equals(a.getAcademicSessionId(),active)&&a.getClassId().equals(s.getClassId())&&sectionIds(a).contains(s.getSectionId())).toList();}
    private void requireStudentAssignment(Assignment a,Student s){if(!visible(a)||!isActiveSession(a)||!a.getClassId().equals(s.getClassId())||!sectionIds(a).contains(s.getSectionId()))throw new ForbiddenException("Assignment is not available to this student");}
    private boolean visible(Assignment a){return List.of(Assignment.Status.PUBLISHED,Assignment.Status.ACTIVE,Assignment.Status.CLOSED).contains(a.getStatus())&&(a.getPublishAt()==null||!a.getPublishAt().isAfter(LocalDateTime.now()));}
    private void requireCanView(Assignment a,Long submittedStudent){if(security.hasRole(RoleName.SCHOOL_ADMIN)||security.hasRole(RoleName.SUPER_ADMIN))return;if(security.hasRole(RoleName.TEACHER)){if(!accessibleAssignmentIds(a.getSchoolId(),List.of(a)).contains(a.getId()))throw new ForbiddenException("Assignment access denied");return;}if(security.hasRole(RoleName.STUDENT)){Student s=currentStudent();requireStudentAssignment(a,s);if(submittedStudent!=null&&!submittedStudent.equals(s.getId()))throw new ForbiddenException("Submission access denied");return;}if(security.hasRole(RoleName.PARENT)){if(!visible(a)||!isActiveSession(a))throw new ForbiddenException("Assignment access denied");Parent p=parents.findBySchoolIdAndUserIdAndDeletedFalse(a.getSchoolId(),security.currentUser().getId()).orElseThrow(()->new ForbiddenException("Parent profile required"));List<Student> children=students.findBySchoolIdAndParentIdAndDeletedFalse(a.getSchoolId(),p.getId());if(submittedStudent!=null){Student child=children.stream().filter(s->s.getId().equals(submittedStudent)).findFirst().orElseThrow(()->new ForbiddenException("Submission access denied"));if(!child.getClassId().equals(a.getClassId())||!sectionIds(a).contains(child.getSectionId()))throw new ForbiddenException("Submission access denied");}else if(children.stream().noneMatch(s->s.getClassId().equals(a.getClassId())&&sectionIds(a).contains(s.getSectionId())))throw new ForbiddenException("Assignment access denied");return;}throw new ForbiddenException("Assignment access denied");}
    private void requireOwnerOrAdmin(Assignment a){if(security.hasRole(RoleName.SCHOOL_ADMIN))return;if(security.hasRole(RoleName.SUPER_ADMIN))throw new ForbiddenException("Super admin assignment access is view-only");if(!security.hasRole(RoleName.TEACHER)||!allSectionsMappedToCurrentTeacher(a))throw new ForbiddenException("Only the teacher currently assigned to every section may perform this operation");}
    private Set<Long> audienceSectionsForCaller(Assignment a){if(!security.hasRole(RoleName.TEACHER))return sectionIds(a);Long teacherId=currentTeacher(a.getSchoolId()).getId();return sectionIds(a).stream().filter(s->teacherSubjects.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndSubjectIdAndTeacherIdAndDeletedFalse(a.getSchoolId(),a.getAcademicSessionId(),a.getClassId(),s,a.getSubjectId(),teacherId).isPresent()).collect(Collectors.toSet());}
    private void requireSubmissionAudience(Assignment a,Long studentId){Student student=students.findByIdAndSchoolIdAndDeletedFalse(studentId,a.getSchoolId()).orElseThrow(()->new ForbiddenException("Student not found"));if(!audienceSectionsForCaller(a).contains(student.getSectionId())||!Objects.equals(a.getClassId(),student.getClassId()))throw new ForbiddenException("Submission student is outside the assignment audience");}
    private Set<Long> accessibleAssignmentIds(Long school,List<Assignment> source){if(!security.hasRole(RoleName.TEACHER))return source.stream().map(Assignment::getId).collect(Collectors.toSet());Long teacherId=currentTeacher(school).getId();return source.stream().filter(a->sectionIds(a).stream().anyMatch(section->teacherSubjects.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndSubjectIdAndTeacherIdAndDeletedFalse(school,a.getAcademicSessionId(),a.getClassId(),section,a.getSubjectId(),teacherId).isPresent())).map(Assignment::getId).collect(Collectors.toSet());}
    private boolean allSectionsMappedToCurrentTeacher(Assignment a){Long teacherId=currentTeacher(a.getSchoolId()).getId();return sectionIds(a).stream().allMatch(section->teacherSubjects.findBySchoolIdAndAcademicSessionIdAndClassIdAndSectionIdAndSubjectIdAndTeacherIdAndDeletedFalse(a.getSchoolId(),a.getAcademicSessionId(),a.getClassId(),section,a.getSubjectId(),teacherId).isPresent());}
    private boolean isActiveSession(Assignment a){return academicYears.findFirstBySchoolIdAndActiveTrueAndDeletedFalseOrderByStartsOnDesc(a.getSchoolId()).map(y->Objects.equals(y.getId(),a.getAcademicSessionId())).orElse(false);}
    private void requireStaff(){if(!security.hasRole(RoleName.TEACHER)&&!security.hasRole(RoleName.SCHOOL_ADMIN)&&!security.hasRole(RoleName.SUPER_ADMIN))throw new ForbiddenException("Staff role required");}
    private Long readSchool(Long requested){Long s=security.schoolScope(requested);modules.require(s,ModuleCode.ASSIGNMENT);return s;} private Long writeSchool(Long requested){Long s=readSchool(requested);if(security.hasRole(RoleName.SUPER_ADMIN))throw new ForbiddenException("Super admin assignment access is view-only");return s;}
    private Assignment find(Long school,Long id){return assignments.findByIdAndSchoolIdAndDeletedFalse(id,school).orElseThrow(()->new ResourceNotFoundException("Assignment not found"));}
    private Teacher currentTeacher(Long school){return teachers.findBySchoolIdAndUserIdAndStatusIgnoreCaseAndDeletedFalse(school,security.currentUser().getId(),"ACTIVE").orElseThrow(()->new ForbiddenException("Active teacher profile required"));}
    private Student currentStudent(){Long school=security.requiredSchoolId();return students.findBySchoolIdAndUserIdAndDeletedFalse(school,security.currentUser().getId()).orElseThrow(()->new ForbiddenException("Student profile required"));}
    private List<StudentAssignment> studentAssignments(Student student){
        List<Assignment> visible=visibleForStudent(student); List<Long> ids=visible.stream().map(Assignment::getId).toList();
        Map<Long,AssignmentSubmission> saved=ids.isEmpty()?Map.of():submissions.findBySchoolIdAndAssignmentIdInAndStudentIdAndDeletedFalse(student.getSchoolId(),ids,student.getId()).stream().collect(Collectors.toMap(AssignmentSubmission::getAssignmentId,s->s,(a,b)->b));
        return visible.stream().map(a->new StudentAssignment(response(a),submission(saved.get(a.getId()),a.getId(),student.getId()))).toList();
    }
    private long pendingForAssignments(Long school,List<Assignment> source){
        List<Student> activeStudents=students.findBySchoolIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(school,"ACTIVE");
        long pending=0;
        for(Assignment a:source.stream().filter(this::visible).toList()){
            Set<Long> audience=audienceSectionsForCaller(a);Set<Long> target=activeStudents.stream().filter(s->a.getClassId().equals(s.getClassId())&&audience.contains(s.getSectionId())).map(Student::getId).collect(Collectors.toSet());
            Set<Long> completed=submissions.findBySchoolIdAndAssignmentIdAndDeletedFalse(school,a.getId()).stream().filter(s->target.contains(s.getStudentId())&&s.getStatus()!=AssignmentSubmission.Status.PENDING&&s.getStatus()!=AssignmentSubmission.Status.RETURNED).map(AssignmentSubmission::getStudentId).collect(Collectors.toSet());
            pending+=target.size()-completed.size();
        }
        return pending;
    }
    private long pendingForDashboardAssignments(Long school,List<Assignment> source){
        List<Student> activeStudents=students.findBySchoolIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(school,"ACTIVE");
        long pending=0;
        for(Assignment a:source){
            Set<Long> audience=audienceSectionsForCaller(a);Set<Long> target=activeStudents.stream().filter(s->a.getClassId().equals(s.getClassId())&&audience.contains(s.getSectionId())).map(Student::getId).collect(Collectors.toSet());
            Set<Long> completed=submissions.findBySchoolIdAndAssignmentIdAndDeletedFalse(school,a.getId()).stream().filter(s->target.contains(s.getStudentId())&&s.getStatus()!=AssignmentSubmission.Status.PENDING&&s.getStatus()!=AssignmentSubmission.Status.RETURNED).map(AssignmentSubmission::getStudentId).collect(Collectors.toSet());
            pending+=target.size()-completed.size();
        }
        return pending;
    }
    private long pendingForStudent(Student student){
        return studentAssignments(student).stream().filter(item->{AssignmentSubmission.Status status=item.submission().status();return status==AssignmentSubmission.Status.PENDING||status==AssignmentSubmission.Status.RETURNED;}).count();
    }
    private void validateAssignmentFiles(List<MultipartFile> files){for(MultipartFile file:Objects.requireNonNullElse(files,List.<MultipartFile>of())){String extension=assignmentExtension(file.getOriginalFilename());if(!ASSIGNMENT_MIME_TYPES.containsKey(extension))throw new IllegalArgumentException("Unsupported assignment file type");String declared=Optional.ofNullable(file.getContentType()).orElse("").split(";",2)[0].trim().toLowerCase(Locale.ROOT);if(ACTIVE_MIME_TYPES.contains(declared))throw new IllegalArgumentException("Active content is not allowed in assignment files");}}
    private Attachment storeAssignmentFile(Long school,Long assignmentId,String area,MultipartFile file){Attachment stored=storage.store(school,assignmentId,area,file);String type=safeAssignmentMime(stored.originalName());return new Attachment(stored.key(),stored.originalName(),type,stored.size());}
    private FileStorageService.StoredFile loadAssignmentFile(Attachment attachment){String type=safeAssignmentMime(attachment.originalName());Attachment safe=new Attachment(attachment.key(),attachment.originalName(),type,attachment.size());return storage.load(safe);}
    private static String safeAssignmentMime(String name){String type=ASSIGNMENT_MIME_TYPES.get(assignmentExtension(name));if(type==null)throw new IllegalArgumentException("Unsupported assignment file type");return type;}
    private static String assignmentExtension(String name){String value=Objects.toString(name,"").replace('\\','/');value=value.substring(value.lastIndexOf('/')+1);int dot=value.lastIndexOf('.');return dot<0?"":value.substring(dot+1).toLowerCase(Locale.ROOT);}
    private AssignmentResponse response(Assignment a){return new AssignmentResponse(a.getId(),a.getAcademicSessionId(),a.getTeacherId(),a.getClassId(),new ArrayList<>(sectionIds(a)),a.getSubjectId(),a.getTitle(),a.getCategory(),a.getDescription(),a.getInstructions(),a.getPublishAt(),a.getDueAt(),a.getMaximumMarks(),a.isAllowLateSubmission(),a.getLateSubmissionDeadline(),effectiveStatus(a,LocalDateTime.now()),attachments(a.getAttachmentMetadata()),a.getReminderSentAt());}
    private SubmissionResponse submission(AssignmentSubmission s,Long assignmentId,Long studentId){return s==null?new SubmissionResponse(null,assignmentId,studentId,List.of(),null,null,null,null,AssignmentSubmission.Status.PENDING,null,null,null,null,null):new SubmissionResponse(s.getId(),s.getAssignmentId(),s.getStudentId(),attachments(s.getAttachmentMetadata()),s.getFileUrl(),s.getAnswerText(),s.getComments(),s.getSubmittedAt(),s.getStatus(),s.getMarks(),s.getPercentage(),s.getFeedback(),s.getReviewedBy(),s.getReviewedAt());}
    private Set<Long> sectionIds(Assignment a){Set<Long> ids=assignmentSections.findBySchoolIdAndAssignmentIdAndDeletedFalse(a.getSchoolId(),a.getId()).stream().map(AssignmentSection::getSectionId).collect(Collectors.toCollection(LinkedHashSet::new));if(ids.isEmpty()&&a.getSectionId()!=null)ids.add(a.getSectionId());return ids;}
    private List<RosterRow> rosterInternal(Long school,Assignment a){Map<Long,AssignmentSubmission> saved=submissions.findBySchoolIdAndAssignmentIdAndDeletedFalse(school,a.getId()).stream().collect(Collectors.toMap(AssignmentSubmission::getStudentId,x->x,(x,y)->y));Set<Long> target=audienceSectionsForCaller(a);return students.findBySchoolIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(school,"ACTIVE").stream().filter(s->s.getClassId().equals(a.getClassId())&&target.contains(s.getSectionId())).map(s->new RosterRow(s.getId(),name(s),s.getAdmissionNumber(),s.getRollNumber(),submission(saved.get(s.getId()),a.getId(),s.getId()))).toList();}
    private void notifyAudience(Assignment a,String event,String message){Set<Long> sectionIds=sectionIds(a);for(Student s:students.findBySchoolIdAndStatusIgnoreCaseAndDeletedFalseOrderByFirstNameAsc(a.getSchoolId(),"ACTIVE")){if(!a.getClassId().equals(s.getClassId())||!sectionIds.contains(s.getSectionId()))continue;if(s.getUserId()!=null)notification(a.getSchoolId(),s.getUserId(),event,message,a.getId());if(s.getParentId()!=null)parents.findByIdAndSchoolIdAndDeletedFalse(s.getParentId(),a.getSchoolId()).map(Parent::getUserId).filter(Objects::nonNull).ifPresent(u->notification(a.getSchoolId(),u,event,message,a.getId()));}}
    private void notifyStudent(Long studentId,Long school,String event,Assignment a){students.findByIdAndSchoolIdAndDeletedFalse(studentId,school).ifPresent(s->{if(s.getUserId()!=null)notification(school,s.getUserId(),event,"Assignment reviewed: "+a.getTitle(),a.getId());if(s.getParentId()!=null)parents.findByIdAndSchoolIdAndDeletedFalse(s.getParentId(),school).map(Parent::getUserId).filter(Objects::nonNull).ifPresent(u->notification(school,u,event,"Assignment reviewed: "+a.getTitle(),a.getId()));});}
    private void notification(Long school,Long user,String event,String message,Long assignmentId){String metadata="{\"assignmentId\":"+assignmentId+"}";if(notifications.existsBySchoolIdAndUserIdAndEventTypeAndMetadataAndDeletedFalse(school,user,event,metadata))return;Notification n=new Notification();n.setSchoolId(school);n.setUserId(user);n.setEventType(event);n.setTitle(event.replace('_',' '));n.setMessage(message);n.setMetadata(metadata);notifications.save(n);}
    private List<Attachment> attachments(String json){if(json==null||json.isBlank())return List.of();try{return objectMapper.readValue(json,new TypeReference<>(){});}catch(Exception e){return List.of();}}
    private String json(Object value){try{return objectMapper.writeValueAsString(value);}catch(Exception e){throw new IllegalStateException("Could not encode attachment metadata",e);}}
    private Attachment findAttachment(String json,String key){return attachments(json).stream().filter(a->a.key().equals(key)).findFirst().orElseThrow(()->new ResourceNotFoundException("Attachment not found"));}
    private static Specification<Assignment> tenant(Long s){return (r,q,b)->b.and(b.equal(r.get("schoolId"),s),b.isFalse(r.get("deleted")));} private static Specification<Assignment> eq(String f,Object v){return(r,q,b)->b.equal(r.get(f),v);}
    private static String clean(String s){return s==null||s.isBlank()?null:s.trim();} private static String name(Student s){return (Objects.toString(s.getFirstName(),"")+" "+Objects.toString(s.getLastName(),"")).trim();}
    private static Assignment.Status effectiveStatus(Assignment a,LocalDateTime now){if(a.getStatus()==Assignment.Status.PUBLISHED&&a.getPublishAt()!=null&&!a.getPublishAt().isAfter(now))return Assignment.Status.ACTIVE;if(a.getStatus()==Assignment.Status.ACTIVE&&a.getDueAt()!=null&&a.getDueAt().isBefore(now)&&(!a.isAllowLateSubmission()||a.getLateSubmissionDeadline()==null||a.getLateSubmissionDeadline().isBefore(now)))return Assignment.Status.CLOSED;return a.getStatus();}
    private static boolean dashboardActive(Assignment a,LocalDateTime start,LocalDateTime end){LocalDateTime deadline=a.isAllowLateSubmission()&&a.getLateSubmissionDeadline()!=null?a.getLateSubmissionDeadline():a.getDueAt();return (a.getStatus()==Assignment.Status.ACTIVE||a.getStatus()==Assignment.Status.PUBLISHED)&&(a.getPublishAt()==null||a.getPublishAt().isBefore(end))&&deadline!=null&&!deadline.isBefore(start);}
    private static boolean isSubmitted(AssignmentSubmission.Status status){return status==AssignmentSubmission.Status.SUBMITTED||status==AssignmentSubmission.Status.LATE||isReviewed(status);}
    private static boolean isReviewed(AssignmentSubmission.Status status){return status==AssignmentSubmission.Status.REVIEWED||status==AssignmentSubmission.Status.RETURNED||status==AssignmentSubmission.Status.GRADED;}
    private static <T> long count(List<T> values,Predicate<T> p){return values.stream().filter(p).count();} private static <T> Map<String,Long> group(List<T> values,java.util.function.Function<T,String> f){return values.stream().collect(Collectors.groupingBy(f,LinkedHashMap::new,Collectors.counting()));}
    private static byte[] csv(List<ReportRow> rows){StringBuilder b=new StringBuilder("Assignment,Student,Status,Submitted,Marks,Percentage\r\n");rows.forEach(r->b.append(q(r.assignmentTitle())).append(',').append(q(r.studentName())).append(',').append(r.status()).append(',').append(Objects.toString(r.submittedAt(),"")).append(',').append(Objects.toString(r.marks(),"")).append(',').append(Objects.toString(r.percentage(),"")).append("\r\n"));return b.toString().getBytes(StandardCharsets.UTF_8);}
    private static byte[] xlsx(List<ReportRow> rows){try(XSSFWorkbook book=new XSSFWorkbook();ByteArrayOutputStream out=new ByteArrayOutputStream()){var sheet=book.createSheet("Assignments");String[] h={"Assignment","Student","Status","Submitted","Marks","Percentage"};var header=sheet.createRow(0);for(int i=0;i<h.length;i++)header.createCell(i).setCellValue(h[i]);int n=1;for(ReportRow r:rows){var row=sheet.createRow(n++);row.createCell(0).setCellValue(r.assignmentTitle());row.createCell(1).setCellValue(r.studentName());row.createCell(2).setCellValue(r.status().name());row.createCell(3).setCellValue(Objects.toString(r.submittedAt(),""));row.createCell(4).setCellValue(Objects.toString(r.marks(),""));row.createCell(5).setCellValue(Objects.toString(r.percentage(),""));}book.write(out);return out.toByteArray();}catch(Exception e){throw new IllegalStateException("Could not export assignment report",e);}}
    private static byte[] pdf(List<ReportRow> rows){List<String> lines=new ArrayList<>(List.of("Assignment Report","Assignment | Student | Status | Marks"));rows.forEach(r->lines.add(r.assignmentTitle()+" | "+r.studentName()+" | "+r.status()+" | "+Objects.toString(r.marks(),"")));return simplePdf(lines);}
    private static byte[] simplePdf(List<String> lines){StringBuilder stream=new StringBuilder("BT /F1 9 Tf 40 800 Td 12 TL ");for(String line:lines.stream().limit(60).toList())stream.append('(').append(line.replace("\\","\\\\").replace("(","\\(").replace(")","\\)").replaceAll("[^\\x20-\\x7E]","?")).append(") Tj T* ");stream.append("ET");List<String> o=List.of("<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [4 0 R] /Count 1 >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>","<< /Length "+stream.length()+" >>\nstream\n"+stream+"\nendstream");ByteArrayOutputStream out=new ByteArrayOutputStream();write(out,"%PDF-1.4\n");List<Integer> offsets=new ArrayList<>();for(int i=0;i<o.size();i++){offsets.add(out.size());write(out,(i+1)+" 0 obj\n"+o.get(i)+"\nendobj\n");}int x=out.size();write(out,"xref\n0 6\n0000000000 65535 f \n");offsets.forEach(v->write(out,String.format("%010d 00000 n \n",v)));write(out,"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"+x+"\n%%EOF\n");return out.toByteArray();}
    private static void write(ByteArrayOutputStream out,String s){out.writeBytes(s.getBytes(StandardCharsets.US_ASCII));} private static String q(String s){return "\""+Objects.toString(s,"").replace("\"","\"\"")+"\"";}
}
