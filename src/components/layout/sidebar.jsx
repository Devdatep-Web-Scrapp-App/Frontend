import { NavLink, useNavigate } from "react-router-dom";

const NAV = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: "/historial",
    label: "Historial",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: "/proyeccion",
    label: "Proyección",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: "/settings",
    label: "Settings",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function Sidebar({ onToggleTheme, theme }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("sp_auth");
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M22 12h-4l-3 9L9 3l-3 9H2"
              stroke={theme === "dark" ? "#2d2b6b" : "white"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            title={label}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {icon}
            <span className="sidebar-tooltip">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="sidebar-link"
          title={theme === "dark" ? "Tema claro" : "Tema oscuro"}
          onClick={onToggleTheme}
        >
          {theme === "dark" ? (
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          <span className="sidebar-tooltip">
            {theme === "dark" ? "Tema claro" : "Tema oscuro"}
          </span>
        </button>

        <button className="sidebar-link" title="Cerrar sesión" onClick={logout}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="sidebar-tooltip">Cerrar sesión</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 72px;
          min-height: 100vh;
          background: var(--bg-sidebar);
          box-shadow: var(--shadow-sidebar);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 0;
          position: sticky;
          top: 0;
          z-index: 100;
          flex-shrink: 0;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .sidebar-logo { margin-bottom: 32px; }
        .logo-mark {
          width: 40px;
          height: 40px;
          background: rgba(45,43,107,0.12);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(45,43,107,0.15);
        }
        [data-theme="dark"] .logo-mark {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.1);
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          width: 100%;
          padding: 0 10px;
          align-items: center;
        }
        .sidebar-link {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-sidebar);
          text-decoration: none;
          border: none;
          background: transparent;
          transition: background 0.15s, color 0.15s;
          cursor: pointer;
        }
        .sidebar-link:hover {
          background: rgba(45,43,107,0.08);
          color: var(--text-sidebar-active);
        }
        [data-theme="dark"] .sidebar-link:hover {
          background: rgba(255,255,255,0.1);
        }
        .sidebar-link.active {
          background: rgba(45,43,107,0.1);
          color: var(--text-sidebar-active);
        }
        [data-theme="dark"] .sidebar-link.active {
          background: rgba(255,255,255,0.15);
        }
        .sidebar-link.active::before {
          content: '';
          position: absolute;
          left: -10px;
          width: 3px;
          height: 24px;
          background: var(--accent-orange);
          border-radius: 0 3px 3px 0;
        }
        .sidebar-tooltip {
          position: absolute;
          left: calc(100% + 12px);
          background: var(--bg-sidebar);
          color: var(--text-sidebar-active);
          font-size: 12px;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: var(--radius-sm);
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 200;
          border: 1px solid var(--border);
        }
        .sidebar-link:hover .sidebar-tooltip {
          opacity: 1;
          transform: translateX(0);
        }
        .sidebar-bottom {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 0 10px;
          width: 100%;
        }
      `}</style>
    </aside>
  );
}
