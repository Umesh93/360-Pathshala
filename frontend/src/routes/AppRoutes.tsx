import { Routes, Route } from "react-router-dom";
import Home from "../public/pages/Home";
import About from "../public/pages/About";
import Features from "../public/pages/Features";
import Pricing from "../public/pages/Pricing";
import Contact from "../public/pages/Contact";
import DemoRequest from "../public/pages/DemoRequest";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/super-admin/Dashboard";
import Schools from "../pages/super-admin/Schools";
import DemoRequests from "../pages/super-admin/DemoRequests";
import ConversionHistory from "../pages/super-admin/ConversionHistory";
import AdminDashboard from "../pages/admin/Dashboard";
import StudentListPage from "../modules/admin/students/pages/StudentListPage";
import StudentDetailPage from "../modules/admin/students/pages/StudentDetailPage";
import AddStudentPage from "../modules/admin/students/pages/AddStudentPage";
import EditStudentPage from "../modules/admin/students/pages/EditStudentPage";
import TeacherListPage from "../modules/admin/teachers/pages/TeacherListPage";
import AddTeacherPage from "../modules/admin/teachers/pages/AddTeacherPage";
import EditTeacherPage from "../modules/admin/teachers/pages/EditTeacherPage";
import TeacherDetailPage from "../modules/admin/teachers/pages/TeacherDetailPage";
import TeacherDashboard from "../pages/teacher/Dashboard";
import StudentDashboard from "../pages/student/Dashboard";
import ParentDashboard from "../pages/parent/Dashboard";
import AdminAttendance from "../pages/admin/Attendance";
import AdminExaminations from "../pages/admin/Examinations";
import TeacherAttendance from "../pages/teacher/Attendance";
import StudentAttendance from "../pages/student/Attendance";
import ParentAttendance from "../pages/parent/Attendance";
import TeacherExams from "../pages/teacher/Exams";
import StudentExams from "../pages/student/Exams";
import ParentResults from "../pages/parent/Results";
import AdminAssignments from "../pages/admin/Assignments";
import TeacherAssignments from "../pages/teacher/Assignments";
import StudentAssignments from "../pages/student/Homework";
import ParentAssignments from "../pages/parent/Assignments";
import ProtectedRoute from "./ProtectedRoute";
import AcademicSetupPage from "../modules/admin/academic/AcademicSetupPage";
import SubjectsWorkspace from "../modules/admin/subjects/SubjectsWorkspace";
import SubjectFormPage from "../modules/admin/subjects/SubjectFormPage";
import SubjectDetailPage from "../modules/admin/subjects/SubjectDetailPage";
import GuardianListPage from "../modules/admin/guardians/pages/GuardianListPage";
import GuardianDetailPage from "../modules/admin/guardians/pages/GuardianDetailPage";
import GuardianFormPage from "../modules/admin/guardians/pages/GuardianFormPage";
import AdminTimetablePage from "../modules/timetables/AdminTimetablePage";
import {
  ParentTimetablePage,
  StudentTimetablePage,
  TeacherTimetablePage,
} from "../modules/timetables/PortalTimetablePages";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/demo" element={<DemoRequest />} />
      <Route path="/login" element={<Login />} />

      {/* Super Admin Routes */}
      <Route
        path="/super-admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/schools"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <Schools />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/demo-requests"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <DemoRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/demo-conversions"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <ConversionHistory />
          </ProtectedRoute>
        }
      />

      {/* School Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/timetable"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <AdminTimetablePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <AdminAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/examinations"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <AdminExaminations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <AdminAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <StudentListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/add"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <AddStudentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/:id"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <StudentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <EditStudentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <AcademicSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <SubjectsWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects/add"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <SubjectFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects/:id"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <SubjectDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <SubjectFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <TeacherListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers/:id"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <TeacherDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <EditTeacherPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers/add"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <AddTeacherPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/guardians"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <GuardianListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/guardians/add"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <GuardianFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/guardians/:id"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <GuardianDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/guardians/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <GuardianFormPage />
          </ProtectedRoute>
        }
      />

      {/* Teacher Portal Routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/timetable"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherTimetablePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/marks"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherExams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/exams"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherExams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/assignments"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherAssignments />
          </ProtectedRoute>
        }
      />

      {/* Student Portal Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/timetable"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentTimetablePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentExams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/exams"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentExams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentAssignments />
          </ProtectedRoute>
        }
      />

      {/* Parent / Guardian Portal Routes */}
      <Route
        path="/parent/dashboard"
        element={
          <ProtectedRoute allowedRoles={["PARENT"]}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/timetable"
        element={
          <ProtectedRoute allowedRoles={["PARENT"]}>
            <ParentTimetablePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/child-attendance"
        element={
          <ProtectedRoute allowedRoles={["PARENT"]}>
            <ParentAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/child-results"
        element={
          <ProtectedRoute allowedRoles={["PARENT"]}>
            <ParentResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/child-assignments"
        element={
          <ProtectedRoute allowedRoles={["PARENT"]}>
            <ParentAssignments />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />
    </Routes>
  );
};

export default AppRoutes;
