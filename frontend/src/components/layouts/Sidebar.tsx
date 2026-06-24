import { Link } from "react-router-dom";

const Sidebar = () => {
  const logout = () => {
    localStorage.clear();

    window.location.href = "/";
  };

  return (
    <div className="sidebar">
      <h2>360 Pathshala</h2>

      <ul>
        <li>
          <Link to="/super-admin/dashboard">Dashboard</Link>
        </li>

        <li>
          <Link to="/super-admin/schools">Schools</Link>
        </li>

        <li>
          <Link to="/super-admin/users">Users</Link>
        </li>

        <li>
          <Link to="/super-admin/settings">Settings</Link>
        </li>
      </ul>

      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Sidebar;
