import { useCallback, useEffect, useMemo, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../firebase";

// Per-property GA4 daily series for every card at once. The function hands back
// a raw series and the board cuts its own windows out of it, so switching
// period costs nothing and never refetches.
//
// The browser can't hold a service-account credential, so this goes through the
// function rather than straight to Google — same hop SiteAnalytics uses.
const endpoint =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:5001/sethbaileydev-84a1e/us-central1/getBoardTraffic"
    : "https://us-central1-sethbaileydev-84a1e.cloudfunctions.net/getBoardTraffic";

const REFRESH_MS = 5 * 60 * 1000;

export const useBoardTraffic = (enabled = true) => {
  const [traffic, setTraffic] = useState(null);
  const [loading, setLoading] = useState(enabled);
  // A GA outage must not take the board down — Firestore still fills the cards.
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(() => Boolean(auth.currentUser));

  // getIdToken() on a null user throws; the board can render a frame before
  // auth rehydrates, so wait for the user rather than racing it.
  useEffect(() => {
    return onIdTokenChanged(auth, (user) => setReady(Boolean(user)));
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled || !auth.currentUser) return;
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${endpoint}?days=64`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
      setTraffic(body);
      setError(null);
    } catch (err) {
      console.error("Error loading board traffic:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !ready) {
      setLoading(false);
      return undefined;
    }
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [enabled, ready, refresh]);

  // Properties GA knows about but hasn't been shared with the function. The
  // board lists these once at the top instead of per card.
  const needsAccess = useMemo(() => {
    if (!traffic?.sites) return [];
    return Object.entries(traffic.sites)
      .filter(([, feed]) => feed.status === "no_access")
      .map(([site, feed]) => ({ site, propertyId: feed.propertyId }));
  }, [traffic]);

  return useMemo(
    () => ({ traffic, loading, error, refresh, needsAccess }),
    [traffic, loading, error, refresh, needsAccess]
  );
};
