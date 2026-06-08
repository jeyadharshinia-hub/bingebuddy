import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginModal({ onClose, defaultMode = "login" }) {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const [mode,     setMode]     = useState(defaultMode);
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setPassword("");
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      const messages = {
        "auth/user-not-found":       "No account found with this email",
        "auth/wrong-password":       "Incorrect password",
        "auth/invalid-credential":   "Incorrect email or password",
        "auth/invalid-email":        "Please enter a valid email address",
        "auth/weak-password":        "Password must be at least 6 characters",
        "auth/too-many-requests":    "Too many attempts. Please try again later",
        // Auto-switch to login when email already registered
        "auth/email-already-in-use": null,
      };

      if (err.code === "auth/email-already-in-use") {
        // Email exists — switch to login and pre-fill the email
        setError("This email already has an account. Sign in instead.");
        switchMode("login");
      } else {
        setError(messages[err.code] || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2 className="login-title">BingeBuddy</h2>
        <p className="login-sub">
          {mode === "login" ? "Sign in to your account" : "Create an account"}
        </p>

        {/* Google */}
        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? "Please wait..." : "Continue with Google"}
        </button>

        <div className="login-divider"><span>or</span></div>

        {/* Email form */}
        <form onSubmit={handleEmail} className="login-form">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus={mode === "login"}
          />
          <input
            type="password"
            placeholder={mode === "signup" ? "Password (min 6 characters)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Mode switch */}
        <p className="login-switch">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
