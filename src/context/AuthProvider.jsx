import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("bb_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const loginWithGoogle = () => {
    const mockUser = {
      uid: "google_" + Date.now(),
      displayName: "Demo User",
      email: "demo@gmail.com",
      photoURL: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      provider: "google",
    };
    setUser(mockUser);
    localStorage.setItem("bb_user", JSON.stringify(mockUser));
  };

  const loginWithEmail = (email, password) => {
    if (!email || !password) throw new Error("Fill in all fields");
    const mockUser = {
      uid: "email_" + Date.now(),
      displayName: email.split("@")[0],
      email,
      photoURL: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      provider: "email",
    };
    setUser(mockUser);
    localStorage.setItem("bb_user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bb_user");
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}