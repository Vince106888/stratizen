import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration object (Production)
const firebaseConfig = {
  apiKey: "REDACTED_FIREBASE_API_KEY",
  authDomain: "p2p-student-platform.firebaseapp.com",
  projectId: "p2p-student-platform",
  storageBucket: "p2p-student-platform.firebasestorage.app",
  messagingSenderId: "23452791627",
  appId: "1:23452791627:web:de87fcbd0ba47949b9aece",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
