import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getDevice() {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod/.test(ua)) return 'mobile';
  if (/tablet|ipad/.test(ua)) return 'tablet';
  return 'desktop';
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem('_pv_sid');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('_pv_sid', id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Tracks page views to admin analytics. Must be inside Router. */
export function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || '/';
    fetch(`${API_BASE}/api/site/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        sessionId: getSessionId(),
        referrer: document.referrer || null,
        device: getDevice(),
      }),
    }).catch(() => {});
  }, [location.pathname]);

  return null;
}
