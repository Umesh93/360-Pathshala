# 360 Pathshala Design

## Phase 1 - Requirements Analysis

Functional requirements: multi-school onboarding, JWT login, role-based access, subscription module enforcement, student/teacher/parent management, academic structure, attendance, exams, assignments, fees, leave, notifications, audit, and dashboards.

Non-functional requirements: tenant isolation by `school_id`, secure password hashing, stateless APIs, normalized MySQL schema, soft delete, audit fields, paginated list APIs, deployment-ready environment variables, and chart-ready dashboard JSON.

Roles: `SUPER_ADMIN` manages SaaS setup across all schools; `SCHOOL_ADMIN` manages one school; `TEACHER` handles classroom operations; `PARENT` views child data and requests leave; `STUDENT` views personal academic data.

Use case diagram description: Super Admin connects to school, subscription, analytics, and audit use cases. School Admin connects to school setup, people management, reports, fees, exams, and notifications. Teacher connects to attendance, assignments, marks, classes, and leave. Parent connects to child attendance, result, fee, assignments, and leave. Student connects to attendance, result, assignments, and notifications.

Permission matrix: Super Admin has global access. School Admin has tenant-wide school access. Teacher has tenant classroom access. Parent has own child access. Student has own profile access. Module-disabled APIs return `403 Forbidden`.

Business rules: every tenant entity stores `school_id`; non-super-admin users cannot request another school; subscribed modules are checked before module APIs execute; deletes are soft deletes; audit columns are maintained by JPA auditing.

System scope: FYP-ready SaaS ERP backend and frontend scaffold with production extensibility for payments, emails, file storage, and detailed reporting.

## Phase 2 - Database Design

ER diagram text: `schools` owns all tenant tables through `school_id`. `users` belongs optionally to a school and has roles. `school_modules` links schools to module codes. Students link to parents, classes, and sections. Teachers link to subjects through `teacher_subjects`. Attendance, exams, assignments, fees, leave, and notifications are tenant-scoped operational tables. Audit tables record actions and access events.

Multi-tenant strategy: single database, shared schema, `school_id` discriminator column on every school-owned table, enforced in service/controller logic and indexed for query isolation.

Indexes: tenant indexes should exist on every `school_id`, plus composite unique indexes for admission number, employee number, and school module subscription.

## Phase 18 - Testing And Deployment

Testing strategy: unit test services for tenant validation and module checks; integration test auth and secured APIs with JWT; API test role permissions and `403` module failures; security test cross-school access; database test unique constraints and soft deletes.

Deployment: configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION_MS`, and `DDL_AUTO=validate` in production. Deploy backend to Render/Railway/VPS, frontend as static Vite build, and MySQL as managed database or VPS service.

Production checklist: use a 256-bit JWT secret, HTTPS, CORS allowlist, database backups, SQL migrations, log retention, seed modules, disable debug SQL, add monitoring, and add object storage for assignment files.
