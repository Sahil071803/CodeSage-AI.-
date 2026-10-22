import { NavLink } from 'react-router-dom';
import { History, Info, LayoutDashboard, Library } from 'lucide-react';
import { USE_MOCK } from '../services/api.js';

const ITEMS = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/knowledge-base', label: 'Knowledge Base', Icon: Library },
  { to: '/history', label: 'Analysis History', Icon: History },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={`sidebar-backdrop${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside id="sidebar" className={`sidebar${open ? ' is-open' : ''}`} aria-label="Sidebar">
        <div>
          <p className="sidebar-section">Workspace</p>
          <nav className="sidebar-nav" aria-label="Main">
            {ITEMS.map(({ to, label, Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="sidebar-link" onClick={onClose}>
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-divider" aria-hidden="true" />

        <div className="about-card">
          <div className="about-title">
            <Info size={15} aria-hidden="true" />
            About CodeSage AI
          </div>
          <p>
            Explains code, flags likely bugs, and cites the programming documentation behind each answer.
          </p>
          {USE_MOCK && <p className="about-note">Demo Mode is on: all results are sample data.</p>}
        </div>
      </aside>
    </>
  );
}
