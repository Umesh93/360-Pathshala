import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ListPage } from './pages/ListPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route element={<DashboardLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="students" element={<ListPage title="Students" endpoint="/people/students" />} />
      <Route path="teachers" element={<ListPage title="Teachers" endpoint="/people/teachers" />} />
      <Route path="attendance" element={<ListPage title="Attendance" endpoint="/operations/attendance/student/1?start=2026-01-01&end=2026-12-31" />} />
      <Route path="fees" element={<ListPage title="Fees" endpoint="/operations/fees/outstanding" />} />
    </Route></Route>
  </Routes></AuthProvider></BrowserRouter>;
}
