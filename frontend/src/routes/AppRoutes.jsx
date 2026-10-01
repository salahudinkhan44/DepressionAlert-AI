// Route table.
//   Public (PublicLayout): /, /about, /contact, /help, /terms, /privacy-policy
//   Public-only: /onboarding, /login, /register, /forgot-password, /reset-password
//   Protected — Standard role (AppLayout): /dashboard, /daily-log,
//     /analysis-result, /analysis/:id, /history, /trends, /alerts,
//     /crisis-support(+breathing), /detox, /privacy, /settings
//   Protected — Authorized Viewer role: /viewer, /viewer/users/:id
//     (viewer also reaches /privacy and /settings)
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import PublicLayout from '../components/layout/PublicLayout';
import AppLayout from '../components/layout/AppLayout';

import LandingPage from '../pages/public/LandingPage';
import OnboardingPage from '../pages/public/OnboardingPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import HelpPage from '../pages/public/HelpPage';
import TermsPage from '../pages/public/TermsPage';
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

import DashboardPage from '../pages/dashboard/DashboardPage';
import DetoxPage from '../pages/dashboard/DetoxPage';
import DailyLogPage from '../pages/daily-log/DailyLogPage';
import AnalysisResultPage from '../pages/analysis-result/AnalysisResultPage';
import AnalysisHistoryPage from '../pages/analysis-history/AnalysisHistoryPage';
import BehavioralTrendsPage from '../pages/behavioral-trends/BehavioralTrendsPage';
import AlertsPage from '../pages/alerts/AlertsPage';
import CrisisSupportPage from '../pages/crisis-support/CrisisSupportPage';
import BreathingExercisePage from '../pages/crisis-support/BreathingExercisePage';
import PrivacyProfilePage from '../pages/privacy/PrivacyProfilePage';
import SettingsPage from '../pages/settings/SettingsPage';

import ViewerDashboardPage from '../pages/viewer/ViewerDashboardPage';
import ViewerCasePage from '../pages/viewer/ViewerCasePage';

import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* public marketing pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      </Route>

      {/* auth flow — only when logged out */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Standard user app */}
      <Route element={<ProtectedRoute roles={['Standard']} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/daily-log" element={<DailyLogPage />} />
          <Route path="/analysis-result" element={<AnalysisResultPage />} />
          <Route path="/analysis/:id" element={<AnalysisResultPage />} />
          <Route path="/history" element={<AnalysisHistoryPage />} />
          <Route path="/trends" element={<BehavioralTrendsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/crisis-support" element={<CrisisSupportPage />} />
          <Route path="/crisis-support/breathing" element={<BreathingExercisePage />} />
          <Route path="/detox" element={<DetoxPage />} />
          <Route path="/privacy" element={<PrivacyProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Authorized Viewer app (also gets privacy/settings pages) */}
      <Route element={<ProtectedRoute roles={['Authorized Viewer']} />}>
        <Route element={<AppLayout />}>
          <Route path="/viewer" element={<ViewerDashboardPage />} />
          <Route path="/viewer/users/:id" element={<ViewerCasePage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={['Authorized Viewer']} />}>
        <Route element={<AppLayout />}>
          <Route path="/viewer/privacy" element={<PrivacyProfilePage />} />
          <Route path="/viewer/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
