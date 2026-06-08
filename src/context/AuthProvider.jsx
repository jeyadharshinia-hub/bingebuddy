import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { setAuthToken } from "../services/apiClient";
import apiClient from "../services/apiClient";

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes — fires on login, logout, and page refresh
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get fresh token and attach to all API requests
        const token = await firebaseUser.getIdToken();
        setAuthToken(token);

        const userData = {
          uid:         firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email:       firebaseUser.email,
          photoURL:    firebaseUser.photoURL,
        };

        setUser(userData);

        // Sync user to MySQL via Java backend
        try {
          await apiClient.post("/user/sync");
        } catch (err) {
          console.error("User sync failed:", err);
        }

      } else {
        setAuthToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // onAuthStateChanged fires automatically after this
  };

  const loginWithEmail = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Set display name immediately after signup
    await updateProfile(result.user, { displayName: name });
    // Force token refresh so the updated name is in the token
    await result.user.getIdToken(true);
  };

  const logout = () => signOut(auth);

  // Don't render the app until we know the auth state
  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{ user, loginWithGoogle, loginWithEmail, signupWithEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}