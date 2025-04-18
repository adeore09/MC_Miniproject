// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVeHkcXSIqp2YW9hZohQfFAOVw57ZFg7I",
  authDomain: "fakenewsdetector-3cd62.firebaseapp.com",
  projectId: "fakenewsdetector-3cd62",
  storageBucket: "fakenewsdetector-3cd62.firebasestorage.app",
  messagingSenderId: "283631382409",
  appId: "1:283631382409:web:9104cf82c085fe1c527b58",
  measurementId: "G-3PP7VG4CTH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
