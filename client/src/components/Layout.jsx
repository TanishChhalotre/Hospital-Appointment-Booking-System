import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EmergencyBanner from "./EmergencyBanner";

const menuItems = [
  { path: "/home", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/departments", label: "Departments" },
  { path: "/contact", label: "Contact Us" },
  { path: "/book-appointment", label: "Book Appointment" },
  { path: "/profile", label: "Profile" },
  { path: "/settings", label: "Settings" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <EmergencyBanner />
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
          <h2>Gurjar Hospital</h2>
          <p>Appointment System</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="user-name">Hello, {user?.name}</p>
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
      </div>
    </div>
  );
}

