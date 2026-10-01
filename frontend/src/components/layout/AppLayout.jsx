// App shell: dark sidebar + sticky topbar + card-based content area
// (SDD §8). Hosts the global SentimentAlertModal for New alerts (UC-8).
import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Icon from '../icons';
import SentimentAlertModal from '../alerts/SentimentAlertModal';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/daily-log': 'Daily Log — Depression Evaluation',
  '/analysis-result': 'Analysis Result',
  '/history': 'Analysis History',
  '/trends': 'Behavioural Trends',
  '/alerts': 'Alerts',
  '/crisis-support': 'Crisis Support & Resources',
  '/crisis-support/breathing': 'Guided Breathing',
  '/detox': 'Digital Detox Session',
  '/privacy': 'Privacy & Profile',
  '/settings': 'Settings',
  '/viewer': 'Monitored Users',
};

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();
  const { pendingAlert, newAlertCount } = useAppData() || {};
  const { isViewer } = useAuth();
  const title = TITLES[pathname] || (pathname.startsWith('/analysis/') ? 'Analysis Detail' : pathname.startsWith('/viewer') ? 'Monitored Users' : 'DepressionAlert AI');

  return (
    <div className="app-shell">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Icon name="menu" size={18} />
          </button>
          <span className="topbar-title">{title}</span>
          <span className="spacer" />
          {!isViewer && (
            <Link to="/daily-log" className="btn btn-soft btn-sm">
              <Icon name="plus" size={15} /> New Evaluation
            </Link>
          )}
          {!isViewer && (
            <Link to="/alerts" className="icon-btn" aria-label="Alerts">
              <Icon name="bell" size={17} />
              {newAlertCount > 0 && <span className="dot" />}
            </Link>
          )}
        </header>
        <main className="content anim-in" key={pathname}>
          <Outlet />
        </main>
      </div>
      <SentimentAlertModal alert={pendingAlert} />
    </div>
  );
}
