import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

// TODO: Replace this with your actual Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase only if API key is provided
let app, auth, db, exportDoc, exportSetDoc, exportGetDoc, exportUpdateDoc, exportIncrement;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  exportDoc = doc;
  exportSetDoc = setDoc;
  exportGetDoc = getDoc;
  exportUpdateDoc = updateDoc;
  exportIncrement = increment;
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
  exportDoc = () => ({});
  exportSetDoc = async () => {};
  exportGetDoc = async () => ({ exists: () => false, data: () => ({}) });
  exportUpdateDoc = async () => {};
  exportIncrement = (n) => n;
}

export { app, auth, db, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, exportDoc as doc, exportSetDoc as setDoc, exportGetDoc as getDoc, exportUpdateDoc as updateDoc, exportIncrement as increment };
