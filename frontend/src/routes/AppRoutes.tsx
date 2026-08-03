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
import AddStudentPage from "../modules/admin/students/pages/AddStudentPage";
import TeacherListPage from "../modules/admin/teachers/pages/TeacherListPage";
import AddTeacherPage from "../modules/admin/teachers/pages/AddTeacherPage";
import TeacherDashboard from "../pages/teacher/Dashboard";
import StudentDashboard from "../pages/student/Dashboard";
import ParentDashboard from "../pages/parent/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

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
        path="/admin/teachers"
        element={
          <ProtectedRoute allowedRoles={["SCHOOL_ADMIN", "ADMIN"]}>
            <TeacherListPage />
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

      {/* Teacher Portal Routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherDashboard />
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

      {/* Parent / Guardian Portal Routes */}
      <Route
        path="/parent/dashboard"
        element={
          <ProtectedRoute allowedRoles={["PARENT"]}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />
    </Routes>
  );
};

export default AppRoutes;
