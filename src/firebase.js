import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCyL8Qhy2FMdOPywQ6bm1RtOfOQBgSq31A",
  authDomain: "bingebuddy-dharsh.firebaseapp.com",
  projectId: "bingebuddy-dharsh",
  storageBucket: "bingebuddy-dharsh.firebasestorage.app",
  messagingSenderId: "808773264894",
  appId: "1:808773264894:web:3c2a3ce24be2b875118caf",
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);