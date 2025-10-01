// Replace with your Firebase web app config (Project settings -> General -> SDK setup and configuration)
// Keep these client-side keys in source control; secure access is handled by Firebase Security Rules.
window.firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Admin whitelist (Google account emails). Replace with your email(s).
window.fhcAdminEmails = [
  "FrameHouseCinema@gmail.com"
];