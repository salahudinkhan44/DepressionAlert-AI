// Left-hand navigation sidebar (SDD §8): Dashboard, Daily Log, Privacy,
// Crisis Support — plus History, Trends, Alerts, Settings. Role-aware:
// Authorized Viewer sees a read-only nav.
import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../icons';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { initials } from '../../utils/format';

const NAV_STANDARD = [
  { section: 'Monitor' },
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/daily-log', icon: 'journal', label: 'Daily Log' },
  { to: '/analysis-result', icon: 'spark', label: 'Latest Result' },
  { to: '/history', icon: 'file', label: 'Analysis History' },
  { to: '/trends', icon: 'chart', label: 'Behavioural Trends' },
  { section: 'Support' },
  { to: '/alerts', icon: 'bell', label: 'Alerts', badge: 'alerts' },
  { to: '/crisis-support', icon: 'heart', label: 'Crisis Support' },
  { section: 'Account' },
  { to: '/privacy', icon: 'shield', label: 'Privacy' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

const NAV_VIEWER = [
  { section: 'Authorized Viewer' },
  { to: '/viewer', icon: 'users', label: 'Monitored Users' },
  { section: 'Account' },
  { to: '/viewer/privacy', icon: 'shield', label: 'Privacy' },
  { to: '/viewer/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout, isViewer } = useAuth();
  const { newAlertCount } = useAppData() || {};
  const navigate = useNavigate();
  const nav = isViewer ? NAV_VIEWER : NAV_STANDARD;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><Icon name="brain" size={18} /></span>
          DepressionAlert AI
        </div>
        <nav>
          {nav.map((item, i) =>
            item.section ? (
              <div key={`s${i}`} className="nav-section">{item.section}</div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.to === '/viewer'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}>
                <Icon name={item.icon} size={18} />
                {item.label}
                {item.badge === 'alerts' && newAlertCount > 0 && (
                  <span className="nav-badge">{newAlertCount}</span>
                )}
              </NavLink>
            )
          )}
        </nav>
        <div className="sidebar-user">
          <span className="avatar">{initials(user?.name)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="small" style={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '.72rem', color: '#64748b' }}>{user?.role}</div>
          </div>
          <button className="icon-btn" style={{ background: 'transparent', borderColor: '#1e293b', color: '#94a3b8' }}
            onClick={handleLogout} title="Log out" aria-label="Log out">
            <Icon name="logout" size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
