package com.pathshala.controller;

import com.pathshala.dto.AssignmentDtos.*;
import com.pathshala.entity.Assignment;
import com.pathshala.service.AssignmentService;
import com.pathshala.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/assignments")
@RequiredArgsConstructor
public class AssignmentController {
    private final AssignmentService service;

    @GetMapping("/dashboard") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Dashboard dashboard(@RequestParam(required=false) Long schoolId){return service.dashboard(schoolId);}
    @GetMapping @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public Page<AssignmentResponse> list(@RequestParam(required=false) Long schoolId,@RequestParam(required=false) Long sessionId,@RequestParam(required=false) Long classId,@RequestParam(required=false) Long sectionId,@RequestParam(required=false) Long subjectId,@RequestParam(required=false) Long teacherId,@RequestParam(required=false) Assignment.Status status,@RequestParam(required=false) String search,Pageable pageable){return service.list(schoolId,sessionId,classId,sectionId,subjectId,teacherId,status,search,pageable);}
    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public AssignmentResponse get(@PathVariable Long id,@RequestParam(required=false) Long schoolId){return service.get(schoolId,id);}
    @PostMapping @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public AssignmentResponse create(@RequestParam(required=false) Long schoolId,@Valid @RequestBody AssignmentRequest request){return service.create(schoolId,request);}
    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public AssignmentResponse update(@PathVariable Long id,@RequestParam(required=false) Long schoolId,@Valid @RequestBody AssignmentRequest request){return service.update(schoolId,id,request);}
    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public void delete(@PathVariable Long id,@RequestParam(required=false) Long schoolId){service.delete(schoolId,id);}
    @PostMapping("/{id}/publish") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public AssignmentResponse publish(@PathVariable Long id,@RequestParam(required=false) Long schoolId){return service.publish(schoolId,id);}
    @PutMapping("/{id}/reopen") @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public AssignmentResponse reopen(@PathVariable Long id,@RequestParam(required=false) Long schoolId,@RequestParam LocalDateTime dueAt){return service.reopen(schoolId,id,dueAt);}

    @GetMapping("/teachers/self") @PreAuthorize("hasRole('TEACHER')")
    public List<AssignmentResponse> teacherSelf(){return service.teacherSelf();}
    @GetMapping("/teachers/self/lookups") @PreAuthorize("hasRole('TEACHER')")
    public List<TeacherAssignmentScope> teacherLookups(){return service.teacherLookups();}
    @GetMapping("/{id}/submissions") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public List<RosterRow> submissions(@PathVariable Long id,@RequestParam(required=false) Long schoolId){return service.roster(schoolId,id);}
    @PutMapping("/{id}/submissions/{submissionId}/review") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public SubmissionResponse review(@PathVariable Long id,@PathVariable Long submissionId,@RequestParam(required=false) Long schoolId,@Valid @RequestBody ReviewRequest request){return service.review(schoolId,id,submissionId,request);}
    @PutMapping("/{id}/submissions/review") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public List<SubmissionResponse> bulkReview(@PathVariable Long id,@RequestParam(required=false) Long schoolId,@Valid @RequestBody BulkReviewRequest request){return service.bulkReview(schoolId,id,request);}

    @GetMapping("/students/self") @PreAuthorize("hasRole('STUDENT')")
    public List<StudentAssignment> studentSelf(){return service.studentSelf();}
    @GetMapping("/{id}/students/self") @PreAuthorize("hasRole('STUDENT')")
    public StudentAssignment studentDetail(@PathVariable Long id){return service.studentDetail(id);}
    @PutMapping("/{id}/students/self/submission") @PreAuthorize("hasRole('STUDENT')")
    public SubmissionResponse submit(@PathVariable Long id,@Valid @RequestBody SubmissionRequest request){return service.submitSelf(id,request,List.of());}
    @PostMapping(value="/{id}/students/self/submission/files",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @PreAuthorize("hasRole('STUDENT')")
    public SubmissionResponse submitFiles(@PathVariable Long id,@RequestPart(required=false) SubmissionRequest request,@RequestPart("files") List<MultipartFile> files){return service.uploadSubmissionFiles(id,request,files);}
    @GetMapping("/parents/self/children") @PreAuthorize("hasRole('PARENT')")
    public List<ChildAssignments> parentChildren(){return service.parentChildren();}

    @GetMapping("/reports") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public List<ReportRow> report(@RequestParam(required=false) Long schoolId,@RequestParam(defaultValue="completion") String type,@RequestParam(required=false) Long sessionId,@RequestParam(required=false) Long studentId,@RequestParam(required=false) Long teacherId,@RequestParam(required=false) Long subjectId){return service.report(schoolId,type,sessionId,studentId,teacherId,subjectId);}
    @GetMapping("/reports/export.{format}") @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> export(@PathVariable String format,@RequestParam(required=false) Long schoolId,@RequestParam(defaultValue="completion") String type,@RequestParam(required=false) Long sessionId,@RequestParam(required=false) Long studentId,@RequestParam(required=false) Long teacherId,@RequestParam(required=false) Long subjectId){String contentType=switch(format.toLowerCase()){case"csv"->"text/csv";case"xlsx"->"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";case"pdf"->MediaType.APPLICATION_PDF_VALUE;default->throw new IllegalArgumentException("Format must be csv, xlsx, or pdf");};return download(service.export(schoolId,type,format,sessionId,studentId,teacherId,subjectId),contentType,"assignment-report."+format,false);}

    @PostMapping(value="/{id}/attachments",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public AssignmentResponse upload(@PathVariable Long id,@RequestParam(required=false) Long schoolId,@RequestPart("files") List<MultipartFile> files){return service.uploadAssignmentFiles(schoolId,id,files);}
    @GetMapping("/{id}/attachments/download") @PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> assignmentFile(@PathVariable Long id,@RequestParam String key,@RequestParam(required=false) Long schoolId){return file(service.downloadAssignment(schoolId,id,key));}
    @GetMapping("/{id}/submissions/{submissionId}/attachments/download") @PreAuthorize("hasAnyRole('STUDENT','PARENT','TEACHER','SCHOOL_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<byte[]> submissionFile(@PathVariable Long id,@PathVariable Long submissionId,@RequestParam String key,@RequestParam(required=false) Long schoolId){return file(service.downloadSubmission(schoolId,id,submissionId,key));}

    private ResponseEntity<byte[]> file(FileStorageService.StoredFile file){String type=file.contentType()==null?MediaType.APPLICATION_OCTET_STREAM_VALUE:file.contentType();boolean inline=type.equals(MediaType.APPLICATION_PDF_VALUE)||type.startsWith("image/");return download(file.bytes(),type,file.originalName(),inline);}
    private ResponseEntity<byte[]> download(byte[] bytes,String type,String filename,boolean inline){HttpHeaders h=new HttpHeaders();h.setContentType(MediaType.parseMediaType(type));h.setContentDisposition((inline?ContentDisposition.inline():ContentDisposition.attachment()).filename(filename).build());h.set("X-Content-Type-Options","nosniff");return ResponseEntity.ok().headers(h).body(bytes);}
}
