// App data context — client-side store for analyses, alerts, settings
// and monitor feed. Pages read via hooks; all mutations go through
// services/api.js so Phase 2 swaps implementations transparently.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [monitor, setMonitor] = useState([]);
  const [pendingAlert, setPendingAlert] = useState(null); // -> SentimentAlertModal

  const refresh = useCallback(async () => {
    if (!user) { setAnalyses([]); return; }
    const standard = user.role === 'Standard';
    const [a, al, s, m] = await Promise.all([
      standard ? api.getAnalyses() : Promise.resolve([]),
      standard ? api.getAlerts() : Promise.resolve([]),
      api.getSettings(),
      api.getMonitorFeed(),
    ]);
    setAnalyses(a);
    setAlerts(al);
    setSettings(s);
    setMonitor(m);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  // After each submission: refresh lists and pop the alert modal (UC-8).
  const afterSubmission = useCallback(async (outcome) => {
    await refresh();
    if (outcome?.alert) setPendingAlert(outcome.alert);
  }, [refresh]);

  const submitText = useCallback(async (text) => {
    const outcome = await api.submitText(text);
    await afterSubmission(outcome);
    return outcome.analysis;
  }, [afterSubmission]);

  const submitCsv = useCallback(async (file) => {
    const outcome = await api.submitCsv(file);
    await afterSubmission(outcome);
    return outcome;
  }, [afterSubmission]);

  const setAlertStatus = useCallback(async (id, status) => {
    await api.updateAlertStatus(id, status);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setPendingAlert((p) => (p?.id === id ? null : p));
  }, []);

  const saveSettings = useCallback(async (patch) => {
    const next = await api.updateSettings(patch);
    setSettings(next);
    return next;
  }, []);

  const value = useMemo(() => ({
    analyses,
    alerts,
    settings,
    monitor,
    pendingAlert,
    setPendingAlert,
    newAlertCount: alerts.filter((a) => a.status === 'New').length,
    latest: analyses?.[0] || null,
    refresh,
    submitText,
    submitCsv,
    setAlertStatus,
    saveSettings,
  }), [analyses, alerts, settings, monitor, pendingAlert, refresh, submitText, submitCsv, setAlertStatus, saveSettings]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export const useAppData = () => useContext(AppDataContext);
