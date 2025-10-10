import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBAEqha-T9VRWdg5Ia3EkUn1bxubc3iVO8",
  authDomain: "charges-714a2.firebaseapp.com",
  projectId: "charges-714a2",
  storageBucket: "charges-714a2.firebasestorage.app",
  messagingSenderId: "931359091554",
  appId: "1:931359091554:web:645492d43a0f349a421a3b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
