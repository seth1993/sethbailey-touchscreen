import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

// Logs one visit per browser session to the "visits" collection.
export const logVisit = async () => {
  if (typeof window === "undefined") return;
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;
  if (sessionStorage.getItem(SESSION_KEY)) return;

  try {
    const ua = navigator.userAgent;
    await addDoc(collection(db, "visits"), {
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
    // Never let tracking break the site
    console.error("Error logging visit:", error);
  }
};
