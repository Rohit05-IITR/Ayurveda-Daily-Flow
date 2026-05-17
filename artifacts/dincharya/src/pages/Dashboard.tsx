import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import "../pages.css";
import "./dashboard.css";

/* ── Types ── */
interface FoodEntry { name: string; qty: number; cal: number; protein: number; carbs: number; fats: number; }
interface AiPlan   { title: string; prakriti: string; eat: string[]; avoid: string[]; lifestyle: string[]; calorieAdvice: string; }
interface DailyData { wakeTime: string; sleepTime: string; mealTime: string; screenTime: string; }

function streakBadge(n: number) {
  if (n >= 30) return "MASTER";
  if (n >= 14) return "ADVANCED";
  if (n >= 7)  return "CONSISTENT";
  if (n >= 3)  return "BUILDING";
  return "BEGINNER";
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: "Good Morning",   emoji: "☀️" };
  if (h >= 12 && h < 17) return { text: "Good Afternoon", emoji: "🌤️" };
  return { text: "Good Evening", emoji: "🌙" };
}

const WEEKLY_SCORE = [
  { day: "Mon", score: 62 },
  { day: "Tue", score: 68 },
  { day: "Wed", score: 71 },
  { day: "Thu", score: 65 },
  { day: "Fri", score: 77 },
  { day: "Sat", score: 74 },
  { day: "Sun", score: 78 },
];

const REMINDERS = [
  { icon: "🌙", text: "Sleep before 10 PM for optimal Vata balance",              color: "#6366f1" },
  { icon: "📵", text: "Avoid late-night screen exposure after 9 PM",               color: "#f59e0b" },
  { icon: "🍽️", text: "Maintain regular meal timing — eat at the same time daily", color: "#10b981" },
  { icon: "🌅", text: "Wake up during Brahma Muhurta (5–6 AM) for clarity",        color: "#f97316" },
  { icon: "💧", text: "Drink warm water first thing every morning",                 color: "#3b82f6" },
];

export default function Dashboard() {
  const name          = localStorage.getItem("name")          || "";
  const prakriti      = localStorage.getItem("prakriti")      || "";
  const prakritiType  = localStorage.getItem("prakritiType")  || prakriti;
  const guna          = localStorage.getItem("guna")          || "";
  const goal          = localStorage.getItem("goal")          || "";
  const healthGoal    = localStorage.getItem("healthGoal")    || "";
  const dailyCalories = parseInt(localStorage.getItem("dailyCalories") || "0", 10);
  const bmi           = localStorage.getItem("bmi")           || "";
  const firstName     = name.split(" ")[0] || "";
  const goalShort     = goal.length > 14 ? goal.split(" ").slice(0, 2).join(" ") : goal;

  const [streak,  setStreak]  = useState(parseInt(localStorage.getItem("streak") || "0", 10));
  const [toast,   setToast]   = useState(false);
  const [barW,    setBarW]    = useState("0%");
  const [mounted, setMounted] = useState(false);

  const [daily, setDaily] = useState<DailyData>(() => {
    const s = JSON.parse(localStorage.getItem("dailyData") || "{}");
    return { wakeTime: s.wakeTime || "", sleepTime: s.sleepTime || "", mealTime: s.mealTime || "", screenTime: s.screenTime || "" };
  });

  const [foodQuery,   setFoodQuery]   = useState("");
  const [foodQty,     setFoodQty]     = useState(1);
  const [foodLog,     setFoodLog]     = useState<FoodEntry[]>([]);
  const [foodError,   setFoodError]   = useState("");
  const [foodLoading, setFoodLoading] = useState(false);

  const [aiPlan,    setAiPlan]    = useState<AiPlan | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setBarW("78%"), 500);
    const t2 = setTimeout(() => setMounted(true), 60);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const totalCal     = foodLog.reduce((s, f) => s + f.cal, 0);
  const totalProtein = foodLog.reduce((s, f) => s + f.protein, 0);
  const totalCarbs   = foodLog.reduce((s, f) => s + f.carbs, 0);
  const totalFats    = foodLog.reduce((s, f) => s + f.fats, 0);
  const remaining    = dailyCalories ? dailyCalories - totalCal : null;
  const calPct       = dailyCalories ? Math.min((totalCal / dailyCalories) * 100, 100) : 0;

  async function addFood() {
    const query = foodQuery.trim();
    if (!query) return;
    setFoodLoading(true);
    setFoodError("");
    try {
      const res  = await fetch(`/api/nutrition?food=${encodeURIComponent(query)}`);
      const data = await res.json() as { items?: { name: string; calories: number; protein_g: number; carbohydrates_total_g: number; fat_total_g: number }[] };
      if (!res.ok || !data.items || data.items.length === 0) {
        setFoodError(`"${query}" not found. Try a different name (e.g. '100g rice').`);
        alert("❌ Food not found. Please try a more specific name.");
        return;
      }
      const item  = data.items[0];
      const scale = foodQty;
      setFoodLog(log => [...log, {
        name:    item.name,
        qty:     foodQty,
        cal:     Math.round(item.calories * scale),
        protein: Math.round(item.protein_g * scale * 10) / 10,
        carbs:   Math.round(item.carbohydrates_total_g * scale * 10) / 10,
        fats:    Math.round(item.fat_total_g * scale * 10) / 10,
      }]);
      alert(`✅ Nutrition data fetched for "${item.name}"`);
      setFoodQuery("");
      setFoodQty(1);
    } catch {
      setFoodError("Network error. Please try again.");
      alert("❌ Failed to fetch nutrition. Check your connection.");
    } finally {
      setFoodLoading(false);
    }
  }

  function removeFood(i: number) { setFoodLog(log => log.filter((_, idx) => idx !== i)); }

  async function generateDietPlan() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/diet-plan", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prakritiType:     prakritiType || prakriti || "Vata-Pitta",
          goal:             healthGoal || goal || "General Wellness",
          bmi:              bmi || "—",
          dailyCalories,
          consumedCalories: totalCal,
        }),
      });
      const data = await res.json() as AiPlan & { error?: string };
      if (!res.ok || data.error) { alert("❌ Failed to generate diet plan. Please try again."); return; }
      setAiPlan(data);
      alert("✅ AI Diet Plan Generated!");
    } catch {
      alert("❌ Failed to generate diet plan. Check your connection.");
    } finally {
      setAiLoading(false);
    }
  }

  function setField(field: keyof DailyData, value: string) { setDaily(d => ({ ...d, [field]: value })); }

  function saveData() {
    localStorage.setItem("dailyData", JSON.stringify({ ...daily, savedAt: new Date().toISOString() }));
    const today = new Date().toDateString();
    if (localStorage.getItem("lastSavedDate") !== today) {
      const n = streak + 1;
      setStreak(n);
      localStorage.setItem("streak", String(n));
      localStorage.setItem("lastSavedDate", today);
    }
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  const { text: greetText, emoji: greetEmoji } = getGreeting();
  const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const macroData = foodLog.length > 0 ? [
    { name: "Protein", value: Math.round(totalProtein), color: "#3b82f6" },
    { name: "Carbs",   value: Math.round(totalCarbs),   color: "#10b981" },
    { name: "Fats",    value: Math.round(totalFats),    color: "#f59e0b" },
  ] : [];

  return (
    <div className={`db-page${mounted ? " db-mounted" : ""}`}>

      {/* ── HEADER ── */}
      <div className="db-header">
        <div className="db-header-glow" />
        <div className="db-header-blob" />
        <div className="db-header-inner">
          <div className="db-header-top">
            <div className="db-brand">
              <span style={{ fontSize: "1.5rem" }}>🌿</span>
              <span className="db-brand-name">Dincharya</span>
            </div>
            <span className="db-date">{dateStr}</span>
          </div>

          <div className="db-greeting">
            {greetText}{firstName ? `, ${firstName}` : ""}!{" "}
            <span className="db-greeting-emoji">{greetEmoji}</span>
          </div>
          <div className="db-greeting-sub">Here's your personalised wellness overview for today.</div>

          <div className="db-header-stats">
            <div className="db-hstat">
              <span className="db-hstat-val">78%</span>
              <span className="db-hstat-lbl">Today's Score</span>
            </div>
            <div className="db-hstat-div" />
            <div className="db-hstat">
              <span className="db-hstat-val">🔥 {streak}</span>
              <span className="db-hstat-lbl">Day Streak</span>
            </div>
            <div className="db-hstat-div" />
            <div className="db-hstat">
              <span className="db-hstat-val">{prakritiType || prakriti || "—"}</span>
              <span className="db-hstat-lbl">Prakriti</span>
            </div>
          </div>
        </div>
      </div>

      <div className="db-content">
        <div className="db-grid">

          {/* ── LEFT COLUMN ── */}
          <div className="db-col-main">

            {/* DINACHARYA SCORE */}
            <div className="db-score-card db-lift">
              <div className="db-card-label">Dinacharya Score</div>
              <div className="db-score-row">
                <div className="db-score-num-wrap">
                  <span className="db-score-num">78</span>
                  <span className="db-score-pct">%</span>
                </div>
                <span className="db-score-delta">↑ +10% vs yesterday</span>
              </div>
              <div className="db-bar-track">
                <div className="db-bar-fill" style={{ width: barW }} />
              </div>
              <div className="db-bar-hint">Keep following your Dinacharya routine to improve!</div>
            </div>

            {/* WEEKLY SCORE CHART */}
            <div className="db-card db-lift">
              <div className="db-card-label">Weekly Score Trend</div>
              <div className="db-section-title" style={{ marginBottom: "1.1rem" }}>Your 7-Day Progress</div>
              <div style={{ height: 175 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WEEKLY_SCORE} margin={{ top: 5, right: 8, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#4ab54a" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#4ab54a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#aab", fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#aab", fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 14, border: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.12)", fontFamily: "Poppins", fontSize: 13 }}
                      formatter={(v: number) => [`${v}%`, "Score"]}
                    />
                    <Area type="monotone" dataKey="score" stroke="#4ab54a" strokeWidth={2.5}
                      fill="url(#scoreGrad)"
                      dot={{ r: 4, fill: "#4ab54a", strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#1e6e1e", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CALORIE TRACKER */}
            <div className="db-card db-lift">
              <div className="db-card-label">Calorie Tracker</div>
              <div className="db-section-title" style={{ marginBottom: "1rem" }}>Log Your Meals</div>

              {dailyCalories > 0 && (
                <div className="cal-target-bar">
                  <div className="cal-target-row">
                    <span className="cal-target-lbl">Daily Target</span>
                    <span className="cal-target-val">{dailyCalories.toLocaleString()} kcal</span>
                  </div>
                  <div className="cal-prog-track">
                    <div className="cal-prog-fill" style={{
                      width: `${calPct}%`,
                      background: remaining !== null && remaining < 0
                        ? "linear-gradient(90deg,#ef4444,#dc2626)"
                        : "linear-gradient(90deg,#4ab54a,#2d8a2d)",
                    }} />
                  </div>
                  <div className="cal-target-row" style={{ marginTop: "0.45rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>
                      {totalCal.toLocaleString()} consumed
                    </span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: remaining !== null && remaining < 0 ? "#ef4444" : "var(--green-600)" }}>
                      {remaining !== null
                        ? remaining >= 0
                          ? `${remaining.toLocaleString()} remaining`
                          : `${Math.abs(remaining).toLocaleString()} over target`
                        : ""}
                    </span>
                  </div>
                </div>
              )}

              <div className="cal-add-row">
                <div className="cal-input-wrap">
                  <span className="cal-input-icon">🍽️</span>
                  <input
                    type="text"
                    placeholder="e.g. 100g rice, 2 eggs, 1 cup dal"
                    value={foodQuery}
                    onChange={e => { setFoodQuery(e.target.value); setFoodError(""); }}
                    onKeyDown={e => e.key === "Enter" && !foodLoading && addFood()}
                    className="cal-food-input"
                    disabled={foodLoading}
                  />
                </div>
                <input
                  type="number" min={0.5} step={0.5} value={foodQty}
                  onChange={e => setFoodQty(Number(e.target.value))}
                  className="cal-qty-input" title="Serving multiplier" disabled={foodLoading}
                />
                <button className="cal-add-btn" onClick={addFood} disabled={foodLoading || !foodQuery.trim()}>
                  {foodLoading ? <span className="cal-btn-spin" /> : <><span>+</span> Add</>}
                </button>
              </div>
              {foodError && <p className="cal-error">{foodError}</p>}

              {foodLog.length > 0 ? (
                <>
                  <div className="cal-log">
                    {foodLog.map((entry, i) => (
                      <div key={i} className="cal-log-row">
                        <span className="cal-log-food-icon">🥗</span>
                        <div className="cal-log-info">
                          <span className="cal-food-name">
                            {entry.name} <span className="cal-qty">×{entry.qty}</span>
                          </span>
                          <div className="cal-macros">
                            <span className="macro macro-cal">{entry.cal} kcal</span>
                            <span className="macro macro-p">P {entry.protein}g</span>
                            <span className="macro macro-c">C {entry.carbs}g</span>
                            <span className="macro macro-f">F {entry.fats}g</span>
                          </div>
                        </div>
                        <button className="cal-remove" onClick={() => removeFood(i)}>✕</button>
                      </div>
                    ))}
                  </div>

                  <div className="cal-totals">
                    {[
                      { num: totalCal.toLocaleString(),     lbl: "kcal",    color: "#10b981" },
                      { num: `${totalProtein.toFixed(1)}g`, lbl: "Protein", color: "#3b82f6" },
                      { num: `${totalCarbs.toFixed(1)}g`,   lbl: "Carbs",   color: "#f59e0b" },
                      { num: `${totalFats.toFixed(1)}g`,    lbl: "Fats",    color: "#ef4444" },
                    ].map(({ num, lbl, color }) => (
                      <div key={lbl} className="cal-total-box" style={{ borderTop: `3px solid ${color}` }}>
                        <span className="cal-total-num" style={{ color }}>{num}</span>
                        <span className="cal-total-lbl">{lbl}</span>
                      </div>
                    ))}
                  </div>

                  {macroData.length > 0 && (
                    <div className="macro-chart-wrap">
                      <div className="db-card-label" style={{ marginBottom: "0.5rem" }}>Macro Breakdown (grams)</div>
                      <div style={{ height: 120 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={macroData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#aab", fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#aab", fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{ borderRadius: 14, border: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.12)", fontFamily: "Poppins", fontSize: 13 }}
                              formatter={(v: number) => [`${v}g`, ""]}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                              {macroData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="cal-empty-state">
                  <div className="cal-empty-icon">🥗</div>
                  <p className="cal-empty">No meals logged yet. Try typing "100g rice" or "2 eggs" above.</p>
                </div>
              )}
            </div>

            {/* DAILY LOG */}
            <div className="db-card db-lift">
              <div className="db-card-label">Today's Dinacharya Log</div>
              <div className="db-section-title" style={{ marginBottom: "1.1rem" }}>Track Your Day</div>
              <div className="db-form-row">
                <div className="db-two-col">
                  <div className="db-field">
                    <label><span className="field-icon">🌅</span>Wake-up Time</label>
                    <input type="time" value={daily.wakeTime} onChange={e => setField("wakeTime", e.target.value)} />
                  </div>
                  <div className="db-field">
                    <label><span className="field-icon">🌙</span>Sleep Time</label>
                    <input type="time" value={daily.sleepTime} onChange={e => setField("sleepTime", e.target.value)} />
                  </div>
                </div>
                <div className="db-two-col">
                  <div className="db-field">
                    <label><span className="field-icon">🍽️</span>Meal Timing</label>
                    <input type="time" value={daily.mealTime} onChange={e => setField("mealTime", e.target.value)} />
                  </div>
                  <div className="db-field">
                    <label><span className="field-icon">📱</span>Screen Time (hrs)</label>
                    <input type="number" min={0} max={24} placeholder="e.g. 3" value={daily.screenTime}
                      onChange={e => setField("screenTime", e.target.value)} />
                  </div>
                </div>
              </div>
              <button className="db-save-btn" onClick={saveData}>💾 Save Today's Data</button>
              {toast && <div className="db-toast">✅ Data saved! Your streak has been updated.</div>}
            </div>

            {/* REMINDERS */}
            <div className="db-card db-lift">
              <div className="db-card-label">Daily Reminders</div>
              <div className="db-section-title" style={{ marginBottom: "1rem" }}>Ayurvedic Wellness Tips</div>
              <div className="db-reminder-list">
                {REMINDERS.map(({ icon, text, color }) => (
                  <div key={text} className="db-reminder-item" style={{ borderLeftColor: color }}>
                    <span className="db-r-icon" style={{ background: `${color}18`, color }}>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="db-col-side">

            {/* STREAK */}
            <div className="db-streak-card db-lift">
              <div className="db-streak-flame">🔥</div>
              <div className="db-streak-info">
                <div className="db-streak-count">{streak}</div>
                <div className="db-streak-lbl">Day Streak</div>
              </div>
              <div className="db-streak-right">
                <span className="db-streak-badge">{streakBadge(streak)}</span>
                <div className="db-streak-dots">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className={`db-sdot${i < Math.min(streak, 7) ? " db-sdot--on" : ""}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* IKS PROFILE */}
            <div className="db-card db-lift">
              <div className="db-card-label">Your IKS Profile</div>
              <div className="db-profile-grid">
                <div className="db-chip db-chip--vata">
                  <div className="db-chip-ico">🌿</div>
                  <div className="db-chip-label">Prakriti</div>
                  <div className="db-chip-value" style={{ fontSize: prakritiType?.includes("-") ? "0.74rem" : "0.9rem" }}>
                    {prakritiType || prakriti || "—"}
                  </div>
                </div>
                <div className="db-chip db-chip--guna">
                  <div className="db-chip-ico">✨</div>
                  <div className="db-chip-label">Guna</div>
                  <div className="db-chip-value">{guna || "—"}</div>
                </div>
                <div className="db-chip db-chip--goal">
                  <div className="db-chip-ico">🎯</div>
                  <div className="db-chip-label">Goal</div>
                  <div className="db-chip-value" style={{ fontSize: "0.8rem" }}>{goalShort || "—"}</div>
                </div>
              </div>
              {bmi && (
                <div className="db-bmi-row">
                  <div className="db-bmi-box">
                    <span className="db-bmi-icon">⚖️</span>
                    <div>
                      <div className="db-chip-label">BMI</div>
                      <div className="db-chip-value">{bmi}</div>
                    </div>
                  </div>
                  {healthGoal && (
                    <div className="db-bmi-box db-bmi-box--wide">
                      <span className="db-bmi-icon">🌱</span>
                      <div>
                        <div className="db-chip-label">Health Goal</div>
                        <div className="db-chip-value" style={{ fontSize: "0.74rem" }}>{healthGoal}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI DIET PLAN */}
            <div className="db-card db-lift db-ai-card">
              <div className="db-card-label">Personalized IKS Diet Plan</div>

              {aiLoading ? (
                <div className="ai-skeleton">
                  <div className="skel skel-title" />
                  <div className="skel skel-badge" />
                  <div className="skel skel-head" />
                  <div className="skel skel-line" />
                  <div className="skel skel-line skel--s" />
                  <div className="skel skel-line" />
                  <div className="skel skel-head" style={{ marginTop: "0.9rem" }} />
                  <div className="skel skel-line" />
                  <div className="skel skel-line skel--s" />
                  <p className="ai-skel-label">✨ Generating your personalised plan…</p>
                </div>
              ) : !aiPlan ? (
                <div className="ai-plan-empty">
                  <div className="ai-plan-icon">🤖</div>
                  <div className="ai-plan-title-text">Your AI Wellness Coach</div>
                  <p className="ai-plan-hint">
                    Get a personalised Ayurvedic diet plan powered by Gemini AI — tailored to your Prakriti, BMI, health goal, and today's nutrition.
                  </p>
                  <button className="ai-gen-btn" onClick={generateDietPlan} disabled={aiLoading}>
                    ✨ Generate AI Plan
                  </button>
                </div>
              ) : (
                <div className="ai-plan-result">
                  <div className="ai-plan-title-row">
                    <div>
                      <div className="ai-plan-theme">{aiPlan.title}</div>
                      <span className="db-diet-dosha">{aiPlan.prakriti}</span>
                    </div>
                    <button className="ai-regen-btn" onClick={generateDietPlan} disabled={aiLoading} title="Regenerate">↻</button>
                  </div>

                  {aiPlan.calorieAdvice && (
                    <div className="ai-calorie-advice">
                      <span>💡</span> {aiPlan.calorieAdvice}
                    </div>
                  )}

                  <div className="iks-diet-section">
                    <div className="iks-diet-heading iks-eat-head"><span>🥦</span> Eat Today</div>
                    <ul className="db-diet-list">
                      {aiPlan.eat.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </div>

                  <div className="iks-diet-section">
                    <div className="iks-diet-heading iks-avoid-head"><span>🚫</span> Avoid</div>
                    <ul className="db-diet-list iks-avoid-list">
                      {aiPlan.avoid.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </div>

                  {aiPlan.lifestyle?.length > 0 && (
                    <div className="iks-diet-section">
                      <div className="iks-diet-heading iks-life-head"><span>🧘</span> Lifestyle</div>
                      <ul className="db-diet-list">
                        {aiPlan.lifestyle.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* HABIT CONSISTENCY CHART */}
            <div className="db-card db-lift">
              <div className="db-card-label">Habit Consistency</div>
              <div className="db-section-title" style={{ marginBottom: "1rem" }}>This Week</div>
              <div style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={WEEKLY_SCORE.map(d => ({ ...d, score: Math.max(d.score - 40, 8) }))}
                    margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#aab", fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ borderRadius: 14, border: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.12)", fontFamily: "Poppins", fontSize: 12 }}
                      formatter={(v: number) => [`${(v as number) + 40}%`, "Consistency"]}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {WEEKLY_SCORE.map((_, i) => (
                        <Cell key={i} fill={i === WEEKLY_SCORE.length - 1 ? "#2d8a2d" : "#a7d7a7"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
