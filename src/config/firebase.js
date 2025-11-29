// src/config/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // For Login/Signup
import { getFirestore } from "firebase/firestore"; // For the Database

// --- PASTE YOUR KEYS FROM FIREBASE CONSOLE BELOW ---
const firebaseConfig = {
  apiKey: "AIzaSyBO2blhXy3nScSIwNFdTeAGWqC90A-Jc-A",
  authDomain: "autoprimeauction.firebaseapp.com",
  projectId: "autoprimeauction",
  storageBucket: "autoprimeauction.firebasestorage.app",
  messagingSenderId: "454533544424",
  appId: "1:454533544424:web:b43b052f2191c619eb8c5d",
};
// --------------------------------------------------

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize Authentication
const auth = getAuth(app);

// 3. Initialize Database (Firestore)
const db = getFirestore(app);

// 4. Export them so other files (like LoginScreen) can use them
export { auth, db };
