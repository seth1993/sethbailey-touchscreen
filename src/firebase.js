// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-5Jqg8ydtR_F42_cycYFc3jXfo-KuQuw",
  authDomain: "sethbaileydev-84a1e.firebaseapp.com",
  projectId: "sethbaileydev-84a1e",
  storageBucket: "sethbaileydev-84a1e.firebasestorage.app",
  messagingSenderId: "302446346986",
  appId: "1:302446346986:web:3bfcd2fc146cdbe3394d93",
  measurementId: "G-LVGZH540B2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if in browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, analytics, auth, db };