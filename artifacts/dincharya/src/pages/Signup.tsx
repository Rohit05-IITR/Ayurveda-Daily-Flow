import { useState } from "react";
import { useLocation } from "wouter";
import { registerUser } from "../services/api";
import "../pages.css";

const GOALS = [
  "Better Sleep", "Weight Balance", "Stress Management",
  "Improve Digestion", "Boost Energy", "Mental Clarity",
  "Skin Health", "General Wellness",
];

interface FormState {
  name: string; email: string; age: string; goal: string; password: string;
}
interface Errors {
  name?: string; email?: string; age?: string; goal?: string; password?: string;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Signup() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState<FormState>({ name: "", email: "", age: "", goal: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [alert, setAlert] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
    setAlert(null);
  }

  function validate(): boolean {
    const e: Errors = {};
    if (!form.name.trim())                                e.name     = "Please enter your name.";
    if (!form.email || !isValidEmail(form.email))         e.email    = "Please enter a valid email.";
    const age = Number(form.age);
    if (!form.age || isNaN(age) || age < 1 || age > 120) e.age      = "Please enter a valid age (1–120).";
    if (!form.goal)                                       e.goal     = "Please select a wellness goal.";
    if (!form.password || form.password.length < 6)       e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { ok, data } = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        age: Number(form.age),
        goal: form.goal,
        password: form.password,
      });
      if (!ok) {
        setAlert({ msg: "⚠️ " + (data.message || "Registration failed."), type: "error" });
        return;
      }
      localStorage.setItem("name",  form.name.trim());
      localStorage.setItem("email", form.email.trim());
      localStorage.setItem("age",   form.age);
      localStorage.setItem("goal",  form.goal);
      navigate("/prakriti");
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
          <div className="auth-badge">🌿 Start Your Journey</div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Tell us a little about yourself so we can personalise your Ayurvedic wellness plan.</p>

          {alert && <div className={`alert-box alert-${alert.type}`}>{alert.msg}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text" placeholder="e.g. Arjun Sharma" autoComplete="name"
              className={errors.name ? "is-error" : ""}
              value={form.name} onChange={e => set("name", e.target.value)}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email" placeholder="e.g. arjun@example.com" autoComplete="email"
              className={errors.email ? "is-error" : ""}
              value={form.email} onChange={e => set("email", e.target.value)}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number" placeholder="e.g. 28" min={1} max={120}
              className={errors.age ? "is-error" : ""}
              value={form.age} onChange={e => set("age", e.target.value)}
            />
            {errors.age && <span className="field-error">{errors.age}</span>}
          </div>

          <div className="form-group">
            <label>Your Wellness Goal</label>
            <div className="select-wrap">
              <select
                className={errors.goal ? "is-error" : ""}
                value={form.goal} onChange={e => set("goal", e.target.value)}
              >
                <option value="">— Select a goal —</option>
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            {errors.goal && <span className="field-error">{errors.goal}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password" placeholder="Create a password (min. 6 characters)" autoComplete="new-password"
              className={errors.password ? "is-error" : ""}
              value={form.password} onChange={e => set("password", e.target.value)}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>

          <div className="auth-divider">or</div>
          <p className="auth-switch">
            Already have an account?{" "}
            <a onClick={() => navigate("/login")}>Sign in</a>
          </p>
        </div>
      </main>
    </div>
  );
}
