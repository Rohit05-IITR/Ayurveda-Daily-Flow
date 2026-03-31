import { useState } from "react";
import { useLocation } from "wouter";
import { loginUser } from "../services/api";
import "../pages.css";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [pwErr, setPwErr]       = useState("");
  const [alert, setAlert]       = useState<{ msg: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading]   = useState(false);

  function validate() {
    let valid = true;
    setEmailErr(""); setPwErr(""); setAlert(null);
    if (!email || !isValidEmail(email)) { setEmailErr("Please enter a valid email."); valid = false; }
    if (!password)                       { setPwErr("Please enter your password.");   valid = false; }
    return valid;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { ok, data } = await loginUser({ email: email.trim(), password });
      if (!ok) {
        setAlert({ msg: "⚠️ " + (data.message || "Login failed."), type: "error" });
        return;
      }
      const user = data.user;
      localStorage.setItem("name",     user.name     || "");
      localStorage.setItem("email",    user.email    || "");
      localStorage.setItem("age",      String(user.age || ""));
      localStorage.setItem("goal",     user.goal     || "");
      localStorage.setItem("prakriti", user.prakriti || "");
      localStorage.setItem("guna",     user.guna     || "");

      setAlert({ msg: `✅ Welcome back, ${(user.name as string).split(" ")[0]}!`, type: "success" });

      setTimeout(() => {
        if (!user.prakriti) navigate("/prakriti");
        else if (!user.guna) navigate("/guna");
        else navigate("/dashboard");
      }, 700);
    } catch {
      setAlert({ msg: "⚠️ Network error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ip-body">
      <nav className="ip-navbar">
        <div className="ip-nav-inner">
          <a href="/" className="ip-logo">
            <span className="ip-logo-leaf">🌿</span>
            <span className="ip-logo-text">Dincharya</span>
          </a>
          <a href="/" className="ip-back">← Back to Home</a>
        </div>
      </nav>

      <div className="ip-bg-circle ip-circle-1" />
      <div className="ip-bg-circle ip-circle-2" />

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-badge">🌿 Welcome Back</div>
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-subtitle">Continue your Ayurvedic wellness journey — pick up right where you left off.</p>

          {alert && <div className={`alert-box alert-${alert.type}`}>{alert.msg}</div>}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email" placeholder="e.g. arjun@example.com" autoComplete="email"
              className={emailErr ? "is-error" : ""}
              value={email} onChange={e => { setEmail(e.target.value); setEmailErr(""); setAlert(null); }}
            />
            {emailErr && <span className="field-error">{emailErr}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password" placeholder="Your password" autoComplete="current-password"
              className={pwErr ? "is-error" : ""}
              value={password} onChange={e => { setPassword(e.target.value); setPwErr(""); setAlert(null); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
            {pwErr && <span className="field-error">{pwErr}</span>}
          </div>

          <button className="btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>

          <div className="auth-divider">or</div>
          <p className="auth-switch">
            New to Dincharya?{" "}
            <a onClick={() => navigate("/signup")}>Create an account</a>
          </p>
        </div>
      </main>
    </div>
  );
}
