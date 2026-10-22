import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Code2, FlaskConical, Github, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { USE_MOCK } from '../services/api.js';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/knowledge-base', label: 'Knowledge Base' },
  { to: '/history', label: 'History' },
];

export default function Navbar({ menuOpen, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <header className="navbar">
      <button
        type="button"
        className="icon-btn nav-toggle"
        onClick={onMenuClick}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={menuOpen}
        aria-controls="sidebar"
      >
        {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      <NavLink to="/" className="brand" aria-label="CodeSage AI home">
        <span className="brand-mark">
          <Code2 size={18} aria-hidden="true" />
        </span>
        <span className="brand-name">CodeSage AI</span>
      </NavLink>

      <nav className="nav-links" aria-label="Primary">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-right">
        {USE_MOCK && (
          <span className="status-pill" title="Showing pre-written sample data. No backend is connected.">
            <FlaskConical size={13} aria-hidden="true" />
            Demo Mode
          </span>
        )}
        <a
          className="icon-btn"
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository (placeholder link)"
        >
          <Github size={18} aria-hidden="true" />
        </a>

        <div className="user-menu" ref={menuRef}>
          <button
            type="button"
            className="avatar"
            onClick={() => setOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Account menu"
          >
            {initial}
          </button>
          {open && (
            <div className="dropdown" role="menu">
              <div className="dropdown-user">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
              <button type="button" role="menuitem" className="dropdown-item" onClick={handleLogout}>
                <LogOut size={15} aria-hidden="true" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
