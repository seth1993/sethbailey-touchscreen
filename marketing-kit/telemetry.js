// Drop-in marketing telemetry for apps that live on their OWN Firebase project.
//
// The board at sethbailey.dev reads three collections out of a single project
// (sethbaileydev-84a1e). A Firestore client is scoped to one project and there
// is no cross-project query, so an app on its own backend has to write here
// directly. This file does that with a SECOND, named Firebase app — your
// existing default app, auth, and Firestore are left completely alone.
//
// Install:
//   1. copy this file into the app (it has no imports beyond `firebase`)
//   2. call logVisit("<slug>") once on mount
// The slug must match a `site` value in the board's projects.js.

import { initializeApp, getApp, getApps } from "firebase/app";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";

// Public web config for the board's project. This is client config, not a
// secret — it already ships in sethbailey.dev's bundle. Overridable by env so
// a staging board can be pointed at instead.
const MARKETING_CONFIG = {
  apiKey: process.env.REACT_APP_MARKETING_API_KEY || "AIzaSyD-5Jqg8ydtR_F42_cycYFc3jXfo-KuQuw",
  authDomain: "sethbaileydev-84a1e.firebaseapp.com",
  projectId: process.env.REACT_APP_MARKETING_PROJECT_ID || "sethbaileydev-84a1e",
  storageBucket: "sethbaileydev-84a1e.firebasestorage.app",
  messagingSenderId: "302446346986",
  appId: "1:302446346986:web:3bfcd2fc146cdbe3394d93",
};

// A named app so it can never collide with the host app's default instance.
// getApps() guard because hot reload would otherwise throw on re-init.
const APP_NAME = "marketing";
const marketingApp = () =>
  getApps().some((a) => a.name === APP_NAME)
    ? getApp(APP_NAME)
    : initializeApp(MARKETING_CONFIG, APP_NAME);

const marketingDb = () => getFirestore(marketingApp());

const SESSION_KEY = "visit_logged";

const getDeviceType = (ua) => {
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/Mobi|iPhone|Android/i.test(ua)) return "Mobile";
  return "Desktop";
};

const getBrowser = (ua) => {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  return "Other";
};

const getReferrerLabel = () => {
  if (!document.referrer) return "Direct";
  try {
    const host = new URL(document.referrer).hostname;
    if (host === window.location.hostname) return "Internal";
    return host.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
};

// One visit per browser session, matching how the board's existing numbers were
// counted — so "visits" means sessions, not page views, everywhere.
export const logVisit = async (site) => {
  if (typeof window === "undefined") return;
  if (!site) {
    console.warn("logVisit called without a site slug — the board would file it under portfolio.");
    return;
  }
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;
  if (sessionStorage.getItem(SESSION_KEY)) return;

  try {
    const ua = navigator.userAgent;
    await addDoc(collection(marketingDb(), "visits"), {
      site,
      timestamp: serverTimestamp(),
      path: window.location.pathname,
      referrer: getReferrerLabel(),
      device: getDeviceType(ua),
      browser: getBrowser(ua),
      language: navigator.language || "unknown",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
      screen: `${window.screen.width}x${window.screen.height}`,
    });
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch (error) {
    // Telemetry must never take the host app down.
    console.error("Error logging visit:", error);
  }
};

// The conversion numerator. Call on the action that actually matters for this
// app — signup, purchase, booking — not on every click.
export const logConversion = async (site, type = "signup", meta = {}) => {
  if (typeof window === "undefined" || !site) return false;
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return false;
  try {
    await addDoc(collection(marketingDb(), "conversions"), {
      site,
      type,
      timestamp: serverTimestamp(),
      ...meta,
    });
    return true;
  } catch (error) {
    console.error("Error logging conversion:", error);
    return false;
  }
};
