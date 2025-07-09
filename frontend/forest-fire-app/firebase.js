// firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtA-BTyn_env_5kVkZ7LQzdkpub3ixA0M",
  authDomain: "forestfire-5a119.firebaseapp.com",
  projectId: "forestfire-5a119",
  storageBucket: "forestfire-5a119.firebasestorage.app",
  messagingSenderId: "566522719089",
  appId: "1:566522719089:web:a8140272c206b8357e24d0",
  measurementId: "G-DKX6Q3LRWR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

// ✅ Export db correctly
export { db };