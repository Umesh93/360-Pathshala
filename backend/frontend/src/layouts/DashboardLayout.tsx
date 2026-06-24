import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  return <div className="d-flex min-vh-100 bg-light">
    <aside className="bg-dark text-white p-3" style={{ width: 260 }}>
      <h4>360 Pathshala</h4>
      <nav className="nav flex-column gap-2 mt-4">
        <Link className="nav-link text-white" to="/">Dashboard</Link>
        <Link className="nav-link text-white" to="/students">Students</Link>
        <Link className="nav-link text-white" to="/teachers">Teachers</Link>
        <Link className="nav-link text-white" to="/attendance">Attendance</Link>
        <Link className="nav-link text-white" to="/fees">Fees</Link>
      </nav>
    </aside>
    <main className="flex-grow-1">
      <header className="d-flex justify-content-between align-items-center bg-white border-bottom p-3">
        <strong>{user?.username}</strong>
        <button className="btn btn-outline-danger btn-sm" onClick={logout}>Logout</button>
      </header>
      <section className="p-4"><Outlet /></section>
    </main>
  </div>;
}
