import { useEffect, useState } from "react";
import "../pages.css";

/* ── Types ── */
interface FoodEntry {
  name: string;
  qty: number;
  cal: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface AiPlan {
  title: string;
  prakriti: string;
  eat: string[];
  avoid: string[];
  lifestyle: string[];
  calorieAdvice: string;
}

interface DailyData {
  wakeTime: string;
  sleepTime: string;
  mealTime: string;
  screenTime: string;
}

function streakBadge(n: number) {
  if (n >= 30) return "MASTER";
  if (n >= 14) return "ADVANCED";
  if (n >= 7)  return "CONSISTENT";
  if (n >= 3)  return "BUILDING";
  return "BEGINNER";
}

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
  const goalShort     = goal.length > 10 ? goal.split(" ")[0] : goal;

  /* ── Streak & score ── */
  const [streak, setStreak] = useState(parseInt(localStorage.getItem("streak") || "0", 10));
  const [toast,  setToast]  = useState(false);
  const [barW,   setBarW]   = useState("0%");

  /* ── Daily log ── */
  const [daily, setDaily] = useState<DailyData>(() => {
    const s = JSON.parse(localStorage.getItem("dailyData") || "{}");
    return {
      wakeTime:   s.wakeTime   || "",
      sleepTime:  s.sleepTime  || "",
      mealTime:   s.mealTime   || "",
      screenTime: s.screenTime || "",
    };
  });

  /* ── Calorie tracker ── */
  const [foodQuery,   setFoodQuery]   = useState("");
  const [foodQty,     setFoodQty]     = useState(1);
  const [foodLog,     setFoodLog]     = useState<FoodEntry[]>([]);
  const [foodError,   setFoodError]   = useState("");
  const [foodLoading, setFoodLoading] = useState(false);

  /* ── AI diet plan ── */
  const [aiPlan,    setAiPlan]    = useState<AiPlan | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBarW("78%"), 300);
    return () => clearTimeout(t);
  }, []);

  /* ── Derived totals ── */
  const totalCal     = foodLog.reduce((s, f) => s + f.cal, 0);
  const totalProtein = foodLog.reduce((s, f) => s + f.protein, 0);
  const totalCarbs   = foodLog.reduce((s, f) => s + f.carbs, 0);
  const totalFats    = foodLog.reduce((s, f) => s + f.fats, 0);
  const remaining    = dailyCalories ? dailyCalories - totalCal : null;

  /* ── CalorieNinjas API ── */
  async function addFood() {
    const query = foodQuery.trim();
    if (!query) return;

    setFoodLoading(true);
    setFoodError("");

    try {
      const res  = await fetch(`/api/nutrition?food=${encodeURIComponent(query)}`);
      const data = await res.json() as { items?: { name: string; calories: number; protein_g: number; carbohydrates_total_g: number; fat_total_g: number; serving_size_g: number }[] };

      if (!res.ok || !data.items || data.items.length === 0) {
        setFoodError(`"${query}" not found. Try a different food name.`);
        alert("❌ Food not found. Please try a more specific name (e.g. '100g rice').");
        return;
      }

      const item = data.items[0];
      const scale = foodQty; // qty treated as serving multiplier

      setFoodLog(log => [...log, {
        name:    item.name,
        qty:     foodQty,
        cal:     Math.round(item.calories     * scale),
        protein: Math.round(item.protein_g    * scale * 10) / 10,
        carbs:   Math.round(item.carbohydrates_total_g * scale * 10) / 10,
        fats:    Math.round(item.fat_total_g  * scale * 10) / 10,
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

  function removeFood(i: number) {
    setFoodLog(log => log.filter((_, idx) => idx !== i));
  }

  /* ── Gemini AI diet plan ── */
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

      if (!res.ok || data.error) {
        alert("❌ Failed to generate diet plan. Please try again.");
        return;
      }

      setAiPlan(data);
      alert("✅ AI Diet Plan Generated!");
    } catch {
      alert("❌ Failed to generate diet plan. Check your connection.");
    } finally {
      setAiLoading(false);
    }
  }

  /* ── Daily log save ── */
  function setField(field: keyof DailyData, value: string) {
    setDaily(d => ({ ...d, [field]: value }));
  }

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

  const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="db-page">
      {/* HEADER */}
      <div className="db-header">
        <div className="db-header-inner">
          <div className="db-header-top">
            <div className="db-brand">
              <span style={{ fontSize: "1.4rem" }}>🌿</span>
              <span className="db-brand-name">Dincharya</span>
            </div>
            <span className="db-date">{dateStr}</span>
          </div>
          <div className="db-greeting">{firstName ? `Namaste, ${firstName}! 🙏` : "Namaste! 🙏"}</div>
          <div className="db-greeting-sub">Here's your wellness overview for today.</div>
        </div>
      </div>

      <div className="db-content">
        <div className="db-grid">

          {/* ── LEFT ── */}
          <div className="db-col-main">

            {/* SCORE */}
            <div className="db-score-card">
              <div className="db-card-label">Dinacharya Score</div>
              <div className="db-score-row">
                <div><span className="db-score-num">78</span><span className="db-score-pct">%</span></div>
                <span className="db-score-delta">↑ +10% vs yesterday</span>
              </div>
              <div className="db-bar-track">
                <div className="db-bar-fill" style={{ width: barW }} />
              </div>
              <div className="db-bar-hint">Keep following your Dinacharya routine to improve!</div>
            </div>

            {/* CALORIE TRACKER */}
            <div className="db-card">
              <div className="db-card-label">Calorie Tracker</div>
              <div className="db-section-title" style={{ marginBottom: "0.9rem" }}>Log Your Meals</div>

              {dailyCalories > 0 && (
                <div className="cal-target-bar">
                  <div className="cal-target-row">
                    <span className="cal-target-lbl">Daily Target</span>
                    <span className="cal-target-val">{dailyCalories.toLocaleString()} kcal</span>
                  </div>
                  <div className="cal-prog-track">
                    <div
                      className="cal-prog-fill"
                      style={{
                        width: `${Math.min((totalCal / dailyCalories) * 100, 100)}%`,
                        background: remaining !== null && remaining < 0 ? "#e05252" : "var(--green-500)",
                      }}
                    />
                  </div>
                  <div className="cal-target-row" style={{ marginTop: "0.4rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>{totalCal} consumed</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: remaining !== null && remaining < 0 ? "#d64444" : "var(--green-600)" }}>
                      {remaining !== null
                        ? remaining >= 0
                          ? `${remaining} remaining`
                          : `${Math.abs(remaining)} over target`
                        : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Add food row */}
              <div className="cal-add-row">
                <div className="cal-input-wrap">
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
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={foodQty}
                  onChange={e => setFoodQty(Number(e.target.value))}
                  className="cal-qty-input"
                  title="Serving multiplier"
                  disabled={foodLoading}
                />
                <button
                  className="cal-add-btn"
                  onClick={addFood}
                  disabled={foodLoading || !foodQuery.trim()}
                >
                  {foodLoading ? "…" : "+ Add"}
                </button>
              </div>
              {foodError && <p className="cal-error">{foodError}</p>}

              {/* Food log */}
              {foodLog.length > 0 ? (
                <>
                  <div className="cal-log">
                    {foodLog.map((entry, i) => (
                      <div key={i} className="cal-log-row">
                        <span className="cal-food-name">
                          {entry.name} <span className="cal-qty">×{entry.qty}</span>
                        </span>
                        <div className="cal-macros">
                          <span className="macro macro-cal">{entry.cal} kcal</span>
                          <span className="macro macro-p">P {entry.protein}g</span>
                          <span className="macro macro-c">C {entry.carbs}g</span>
                          <span className="macro macro-f">F {entry.fats}g</span>
                        </div>
                        <button className="cal-remove" onClick={() => removeFood(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="cal-totals">
                    <div className="cal-total-box">
                      <span className="cal-total-num">{totalCal}</span>
                      <span className="cal-total-lbl">kcal</span>
                    </div>
                    <div className="cal-total-box">
                      <span className="cal-total-num">{totalProtein.toFixed(1)}g</span>
                      <span className="cal-total-lbl">Protein</span>
                    </div>
                    <div className="cal-total-box">
                      <span className="cal-total-num">{totalCarbs.toFixed(1)}g</span>
                      <span className="cal-total-lbl">Carbs</span>
                    </div>
                    <div className="cal-total-box">
                      <span className="cal-total-num">{totalFats.toFixed(1)}g</span>
                      <span className="cal-total-lbl">Fats</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="cal-empty">
                  No meals logged yet. Try typing "100g rice" or "2 eggs" above.
                </p>
              )}
            </div>

            {/* TODAY'S LOG */}
            <div className="db-card">
              <div className="db-card-label">Today's Dinacharya Log</div>
              <div className="db-section-title" style={{ marginBottom: "1rem" }}>Track Your Day</div>
              <div className="db-form-row">
                <div className="db-two-col">
                  <div className="db-field">
                    <label>Wake-up Time</label>
                    <input type="time" value={daily.wakeTime} onChange={e => setField("wakeTime", e.target.value)} />
                  </div>
                  <div className="db-field">
                    <label>Sleep Time</label>
                    <input type="time" value={daily.sleepTime} onChange={e => setField("sleepTime", e.target.value)} />
                  </div>
                </div>
                <div className="db-two-col">
                  <div className="db-field">
                    <label>Meal Timing</label>
                    <input type="time" value={daily.mealTime} onChange={e => setField("mealTime", e.target.value)} />
                  </div>
                  <div className="db-field">
                    <label>Screen Time (hrs)</label>
                    <input
                      type="number"
                      min={0}
                      max={24}
                      placeholder="e.g. 3"
                      value={daily.screenTime}
                      onChange={e => setField("screenTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button className="db-save-btn" onClick={saveData}>Save Today's Data</button>
              {toast && <div className="db-toast">✅ Data saved! Streak updated.</div>}
            </div>

            {/* REMINDERS */}
            <div className="db-card">
              <div className="db-card-label">Daily Reminders</div>
              <div className="db-reminder-list">
                {[
                  ["🌙", "Sleep before 10 PM for optimal Vata balance"],
                  ["📵", "Avoid late-night screen exposure after 9 PM"],
                  ["🍽️", "Maintain regular meal timing — eat at the same time daily"],
                  ["🌅", "Wake up during Brahma Muhurta (5–6 AM) for clarity"],
                  ["💧", "Drink warm water first thing every morning"],
                ].map(([icon, text]) => (
                  <div key={text} className="db-reminder-item">
                    <span className="db-r-icon">{icon}</span>{text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="db-col-side">

            {/* STREAK */}
            <div className="db-streak-card">
              <span className="db-streak-icon">🔥</span>
              <div>
                <div className="db-streak-count">{streak}</div>
                <div className="db-streak-lbl">Day Streak</div>
              </div>
              <span className="db-streak-badge">{streakBadge(streak)}</span>
            </div>

            {/* IKS PROFILE */}
            <div className="db-card">
              <div className="db-card-label">Your IKS Profile</div>
              <div className="db-profile-grid">
                <div className="db-chip">
                  <div className="db-chip-label">Prakriti</div>
                  <div
                    className="db-chip-value"
                    style={{ fontSize: prakritiType?.includes("-") ? "0.78rem" : "0.92rem" }}
                  >
                    {prakritiType || prakriti || "—"}
                  </div>
                </div>
                <div className="db-chip">
                  <div className="db-chip-label">Guna</div>
                  <div className="db-chip-value">{guna || "—"}</div>
                </div>
                <div className="db-chip">
                  <div className="db-chip-label">Goal</div>
                  <div className="db-chip-value">{goalShort || "—"}</div>
                </div>
              </div>
              {bmi && (
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                  <div className="db-chip" style={{ flex: 1 }}>
                    <div className="db-chip-label">BMI</div>
                    <div className="db-chip-value">{bmi}</div>
                  </div>
                  {healthGoal && (
                    <div className="db-chip" style={{ flex: 2 }}>
                      <div className="db-chip-label">Health Goal</div>
                      <div className="db-chip-value" style={{ fontSize: "0.78rem" }}>{healthGoal}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI DIET PLAN */}
            <div className="db-card">
              <div className="db-card-label">Personalized IKS Diet Plan</div>

              {!aiPlan ? (
                <div className="ai-plan-empty">
                  <div className="ai-plan-icon">🤖</div>
                  <p className="ai-plan-hint">
                    Get a personalised Ayurvedic diet plan generated by AI — tailored to your Prakriti, BMI, goal, and today's nutrition.
                  </p>
                  <button
                    className="ai-gen-btn"
                    onClick={generateDietPlan}
                    disabled={aiLoading}
                  >
                    {aiLoading
                      ? <><span className="ai-spinner" /> Generating…</>
                      : "✨ Generate AI Plan"}
                  </button>
                </div>
              ) : (
                <div className="ai-plan-result">
                  <div className="ai-plan-title-row">
                    <div>
                      <div className="ai-plan-theme">{aiPlan.title}</div>
                      <span className="db-diet-dosha">{aiPlan.prakriti}</span>
                    </div>
                    <button
                      className="ai-regen-btn"
                      onClick={generateDietPlan}
                      disabled={aiLoading}
                      title="Regenerate"
                    >
                      {aiLoading ? "…" : "↻"}
                    </button>
                  </div>

                  {aiPlan.calorieAdvice && (
                    <div className="ai-calorie-advice">
                      💡 {aiPlan.calorieAdvice}
                    </div>
                  )}

                  <div className="iks-diet-section">
                    <div className="iks-diet-heading iks-eat-head">✅ Eat Today</div>
                    <ul className="db-diet-list">
                      {aiPlan.eat.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </div>

                  <div className="iks-diet-section" style={{ marginTop: "0.85rem" }}>
                    <div className="iks-diet-heading iks-avoid-head">❌ Avoid</div>
                    <ul className="db-diet-list iks-avoid-list">
                      {aiPlan.avoid.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </div>

                  {aiPlan.lifestyle?.length > 0 && (
                    <div className="iks-diet-section" style={{ marginTop: "0.85rem" }}>
                      <div className="iks-diet-heading" style={{ background: "#e8f4ff", color: "#3a7abd" }}>🧘 Lifestyle</div>
                      <ul className="db-diet-list">
                        {aiPlan.lifestyle.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
