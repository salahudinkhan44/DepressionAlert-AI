import { Link, Outlet } from 'react-router-dom';
import Icon from '../icons';

export function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark"><Icon name="brain" size={18} /></span>
      DepressionAlert AI
    </Link>
  );
}

export default function PublicLayout() {
  return (
    <div>
      <nav className="public-nav">
        <div className="public-nav-inner">
          <Brand />
          <div className="nav-links">
            <Link to="/about">About</Link>
            <Link to="/help">Help</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
          <Link to="/login" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>Log in</Link>
        </div>
      </nav>
      <Outlet />
      <footer className="public-footer">
        <div className="public-footer-inner">
          <div>
            <div className="brand" style={{ color: '#fff', marginBottom: '.8rem' }}>
              <span className="brand-mark"><Icon name="brain" size={18} /></span>
              DepressionAlert AI
            </div>
            <p className="small" style={{ maxWidth: 340 }}>
              AI-assisted early awareness of depression-related patterns in the text you choose
              to share. Advisory only — not a diagnostic or clinical tool.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '.85rem' }}>Product</h4>
            <Link to="/about">About</Link>
            <Link to="/help">Help &amp; FAQ</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '.85rem' }}>Legal</h4>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>FYP — COMSATS University Islamabad, Abbottabad Campus</span>
          <span>Salahudin Khan &amp; Muhammad Azan · Supervisor: Ms. Sara Shafique</span>
        </div>
      </footer>
    </div>
  );
}
