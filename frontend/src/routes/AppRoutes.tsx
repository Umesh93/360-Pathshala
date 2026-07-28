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

      {/* Protected Routes */}
      <Route
        path="/super-admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/schools"
        element={
          <ProtectedRoute>
            <Schools />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/demo-requests"
        element={
          <ProtectedRoute>
            <DemoRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/demo-conversions"
        element={
          <ProtectedRoute>
            <ConversionHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute>
            <StudentListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/add"
        element={
          <ProtectedRoute>
            <AddStudentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute>
            <TeacherListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers/add"
        element={
          <ProtectedRoute>
            <AddTeacherPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
