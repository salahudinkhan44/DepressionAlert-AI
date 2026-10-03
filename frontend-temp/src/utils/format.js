// Small formatting helpers shared across pages.
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function initials(name = '') {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
}

// SDD 6.3: >=70 High, >=40 Moderate, else Low
export function riskLevel(score) {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
}

export function riskClass(level) {
  return { Low: 'badge-low', Moderate: 'badge-moderate', High: 'badge-high' }[level] || 'badge-neutral';
}

export function riskColor(level) {
  return { Low: 'var(--low)', Moderate: 'var(--moderate)', High: 'var(--high)' }[level] || 'var(--ink-300)';
}
