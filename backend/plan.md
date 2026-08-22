# 360 Pathshala Development Plan

## Goal
Build `360 Pathshala` as a secure multi-tenant school ERP SaaS platform with school-level data isolation, module-based subscriptions, JWT authentication, audit tracking, and chart-ready analytics.

## Delivery Principles
- API-first backend development.
- Shared MySQL database with strict `school_id` isolation.
- Role-based access control for all users.
- Module access checks before protected business actions.
- Flyway-managed schema changes only.
- Audit every sensitive action, especially super admin school access.

## Phase 1: Foundation
Set up the enterprise Spring Boot baseline.

Deliverables:
- Clean package structure
- `application.yml` and environment profile strategy
- MySQL connection setup
- Flyway migration baseline
- Common response and exception handling
- OpenAPI documentation setup

Exit criteria:
- Application starts cleanly against MySQL.
- Health and base API endpoints are available.

## Phase 2: Security and Identity
Implement authentication and authorization.

Deliverables:
- JWT access token and refresh token flow
- Register, login, logout, forgot password, reset password
- BCrypt password encoding
- Role-based security for `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `PARENT`, `STUDENT`
- `CustomUserDetailsService`, `JwtService`, `JwtFilter`, `SecurityConfig`

Exit criteria:
- Secured endpoints reject unauthenticated requests.
- Tokens contain user and school context.

## Phase 3: Multi-Tenancy
Enforce tenant isolation with `school_id`.

Deliverables:
- `TenantContext`
- `TenantResolver`
- `TenantFilter`
- `TenantInterceptor`
- School ownership validation in services

Exit criteria:
- A school user cannot read or modify another school’s data.
- Super admin access is traceable in audit logs.

## Phase 4: Subscription Management
Restrict access by purchased modules.

Deliverables:
- `Module`, `SubscriptionPlan`, `SchoolModule` entities
- Module activation and deactivation APIs
- `@RequireModule` annotation
- Access middleware/aspect to reject unauthorized module usage

Exit criteria:
- Protected module APIs return `403` when the school has not purchased the module.

## Phase 5: Master Data and User Management
Build the core setup data and user lifecycle.

Deliverables:
- School admin creation
- Teacher, parent, and student creation
- Deactivate user
- Reset password
- Academic structure: class, section, subject, subject assignment

Exit criteria:
- A school can be fully configured for academic operations.

## Phase 6: Student and Academic Operations
Implement student lifecycle and school operations.

Deliverables:
- Student profile CRUD
- Admission number and roll number management
- Guardian assignment
- Student transfer and promotion
- Search and pagination

Exit criteria:
- Student records are manageable end-to-end from admission to promotion.

## Phase 7: Attendance
Implement daily attendance workflows and reports.

Deliverables:
- Teacher attendance marking
- Present, absent, leave statuses
- Admin attendance reports
- Parent and student attendance views
- Monthly analytics APIs

Exit criteria:
- Attendance can be marked and reported by role.

## Phase 8: Examination
Implement exam scheduling, marks entry, and results.

Deliverables:
- Exam types
- Exam creation and subject assignment
- Marks entry APIs
- Grade, GPA, rank, and result publication logic

Exit criteria:
- Teachers can enter marks and publish results.

## Phase 9: Assignment
Implement assignment creation and submission flow.

Deliverables:
- Assignment CRUD
- File attachment metadata
- Student submission APIs
- Teacher evaluation APIs

Exit criteria:
- Assignments can be created, submitted, and evaluated.

## Phase 10: Fee Management
Implement school fee operations.

Deliverables:
- Fee categories and fee structures
- Fee collection
- Discounts, scholarships, and fines
- Outstanding and payment history APIs
- Parent fee dashboard

Exit criteria:
- Fees can be tracked from setup through collection.

## Phase 11: Leave Management
Implement leave request workflow.

Deliverables:
- Teacher leave requests
- Student leave requests
- Parent leave requests for children
- Pending, approved, rejected workflow
- Notification integration

Exit criteria:
- Leave approvals and rejections are visible to request owners.

## Phase 12: Notification System
Implement in-app notifications first.

Deliverables:
- Notification entity and service
- Event-driven notification creation
- Read/unread APIs
- Support for attendance, fee, result, assignment, and leave events

Exit criteria:
- All major workflow events create notifications.

## Phase 13: Audit and Privacy
Track security-sensitive and data-sensitive activity.

Deliverables:
- `AuditLog` entity
- `DataAccessLog` entity
- Login, logout, create, update, delete, export tracking
- Super admin school access notifications
- Session duration, IP address, reason capture

Exit criteria:
- Every sensitive access path is auditable.

## Phase 14: Analytics Dashboard
Return dashboard-ready JSON for each role.

Deliverables:
- School admin dashboard APIs
- Teacher dashboard APIs
- Parent dashboard APIs
- Student dashboard APIs
- Chart-friendly summary responses

Exit criteria:
- Dashboards can render metrics without extra transformation.

## Recommended Build Order
1. Foundation
2. Security and identity
3. Multi-tenancy
4. Subscription management
5. Master data and user management
6. Academic structure
7. Student management
8. Attendance
9. Examination
10. Assignment
11. Fee management
12. Leave management
13. Notification system
14. Audit and privacy
15. Analytics dashboard

## Suggested Repository Structure
```text
src/main/java/com/pathshala
  config
  security
  tenant
  subscription
  audit
  exception
  auth
  school
  user
  academic
  student
  teacher
  parent
  attendance
  examination
  assignment
  fee
  leave
  notification
  analytics
```

## Milestones
- Milestone 1: Backend foundation and database connectivity
- Milestone 2: Authentication, tenant isolation, and module access control
- Milestone 3: School setup, users, and academic structure
- Milestone 4: Student, attendance, exam, and assignment workflows
- Milestone 5: Fee, leave, notification, audit, and analytics

## Immediate Next Step
Start by replacing the current monolithic implementation with a clean Spring Boot foundation, then implement authentication and tenant enforcement before adding any business module APIs.
