import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

// TODO: Replace this with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase only if API key is replaced (prevents crashing on load with dummy data)
let app, auth, db;

if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.warn("Firebase config is missing. Authentication and database features will use local mock data.");
  // Mock implementations for local testing without Firebase
  auth = {
    onAuthStateChanged: (cb) => {
      // Mock unauthenticated state initially
      const mockUser = JSON.parse(localStorage.getItem('mockUser'));
      cb(mockUser || null); 
    },
    signOut: async () => {
      localStorage.removeItem('mockUser');
      window.location.reload();
    }
  };
  
  db = {
    doc: () => ({}),
    getDoc: async () => ({ exists: () => false, data: () => ({}) }),
    setDoc: async () => {},
    updateDoc: async () => {}
  };
}

export { app, auth, db, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, updateDoc, increment };
