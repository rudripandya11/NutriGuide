// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGrQI5seHv6ATlNLUxjMDQpASlu4BPof4",
  authDomain: "nutriguide-23c40.firebaseapp.com",
  projectId: "nutriguide-23c40",
  storageBucket: "nutriguide-23c40.appspot.com",
  messagingSenderId: "782026733742",
  appId: "1:782026733742:web:21a9e7fc1a0255cce3153f",
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Firebase Authentication
export const auth = getAuth(app);

// 🗄 Firestore Database
export const db = getFirestore(app);

export default app;
