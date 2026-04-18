import { useEffect, useState } from "react";
import { getDietPlan } from "../lib/diet";
import "../pages.css";

const FOOD_DB: Record<string, { cal: number; protein: number; carbs: number; fats: number }> = {
  rice:    { cal: 130, protein: 2.7, carbs: 28,   fats: 0.3 },
  egg:     { cal: 78,  protein: 6,   carbs: 0.6,  fats: 5   },
  paneer:  { cal: 265, protein: 18,  carbs: 3,    fats: 20  },
  milk:    { cal: 42,  protein: 3.4, carbs: 5,    fats: 1   },
  dal:     { cal: 116, protein: 9,   carbs: 20,   fats: 0.4 },
  roti:    { cal: 104, protein: 3.5, carbs: 18,   fats: 2.8 },
  banana:  { cal: 89,  protein: 1.1, carbs: 23,   fats: 0.3 },
  yogurt:  { cal: 61,  protein: 3.5, carbs: 4.7,  fats: 3.3 },
  chicken: { cal: 165, protein: 31,  carbs: 0,    fats: 3.6 },
  oats:    { cal: 71,  protein: 2.5, carbs: 12,   fats: 1.5 },
  ghee:    { cal: 112, protein: 0,   carbs: 0,    fats: 12.7},
  apple:   { cal: 52,  protein: 0.3, carbs: 14,   fats: 0.2 },
};

interface FoodEntry {
  name: string;
  qty: number;
  cal: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DailyData { wakeTime: string; sleepTime: string; mealTime: string; screenTime: string; }

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

  const diet = getDietPlan(prakritiType || prakriti);

  const [streak, setStreak] = useState(parseInt(localStorage.getItem("streak") || "0", 10));
  const [toast,  setToast]  = useState(false);
  const [barW,   setBarW]   = useState("0%");
  const [daily,  setDaily]  = useState<DailyData>(() => {
    const s = JSON.parse(localStorage.getItem("dailyData") || "{}");
    return { wakeTime: s.wakeTime || "", sleepTime: s.sleepTime || "", mealTime: s.mealTime || "", screenTime: s.screenTime || "" };
  });

  // Calorie tracker state
  const [foodQuery,    setFoodQuery]    = useState("");
  const [foodQty,      setFoodQty]      = useState(1);
  const [foodLog,      setFoodLog]      = useState<FoodEntry[]>([]);
  const [foodError,    setFoodError]    = useState("");
  const [calorieToast, setCalorieToast] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setBarW("78%"), 300);
    return () => clearTimeout(t);
  }, []);

  const totalCal     = foodLog.reduce((s, f) => s + f.cal, 0);
  const totalProtein = foodLog.reduce((s, f) => s + f.protein, 0);
  const totalCarbs   = foodLog.reduce((s, f) => s + f.carbs, 0);
  const totalFats    = foodLog.reduce((s, f) => s + f.fats, 0);
  const remaining    = dailyCalories ? dailyCalories - totalCal : null;

  function addFood() {
    const key = foodQuery.trim().toLowerCase();
    const entry = FOOD_DB[key];
    if (!entry) {
      setFoodError(`"${foodQuery}" not found. Try: ${Object.keys(FOOD_DB).join(", ")}.`);
      return;
    }
    setFoodError("");
    const qty = Math.max(0.1, foodQty);
    setFoodLog(log => [...log, {
      name: key,
      qty,
      cal:     Math.round(entry.cal     * qty),
      protein: Math.round(entry.protein * qty * 10) / 10,
      carbs:   Math.round(entry.carbs   * qty * 10) / 10,
      fats:    Math.round(entry.fats    * qty * 10) / 10,
    }]);
    setFoodQuery("");
    setFoodQty(1);
  }

  function removeFood(i: number) {
    setFoodLog(log => log.filter((_, idx) => idx !== i));
  }

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
                        background: remaining !== null && remaining < 0 ? "#e05252" : "var(--green-500)"
                      }}
                    />
                  </div>
                  <div className="cal-target-row" style={{ marginTop: "0.4rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>{totalCal} consumed</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: remaining !== null && remaining < 0 ? "#d64444" : "var(--green-600)" }}>
                      {remaining !== null ? (remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`) : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Add food row */}
              <div className="cal-add-row">
                <div className="cal-input-wrap">
                  <input
                    type="text"
                    placeholder="Food name (e.g. rice, egg, dal)"
                    value={foodQuery}
                    onChange={e => { setFoodQuery(e.target.value); setFoodError(""); }}
                    onKeyDown={e => e.key === "Enter" && addFood()}
                    list="food-options"
                    className="cal-food-input"
                  />
                  <datalist id="food-options">
                    {Object.keys(FOOD_DB).map(f => <option key={f} value={f} />)}
                  </datalist>
                </div>
                <input
                  type="number" min={0.1} step={0.5}
                  value={foodQty}
                  onChange={e => setFoodQty(Number(e.target.value))}
                  className="cal-qty-input"
                  title="Servings"
                />
                <button className="cal-add-btn" onClick={addFood}>+ Add</button>
              </div>
              {foodError && <p className="cal-error">{foodError}</p>}

              {/* Food log */}
              {foodLog.length > 0 && (
                <>
                  <div className="cal-log">
                    {foodLog.map((entry, i) => (
                      <div key={i} className="cal-log-row">
                        <span className="cal-food-name">{entry.name} <span className="cal-qty">×{entry.qty}</span></span>
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

                  {/* Totals */}
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
              )}

              {foodLog.length === 0 && (
                <p className="cal-empty">No meals logged yet. Search and add your first meal above.</p>
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
                    <input type="number" min={0} max={24} placeholder="e.g. 3" value={daily.screenTime} onChange={e => setField("screenTime", e.target.value)} />
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
                  <div className="db-chip-value" style={{ fontSize: prakritiType && prakritiType.includes("-") ? "0.78rem" : "0.92rem" }}>
                    {prakritiType || prakriti || "—"}
                  </div>
                </div>
                <div className="db-chip"><div className="db-chip-label">Guna</div><div className="db-chip-value">{guna || "—"}</div></div>
                <div className="db-chip"><div className="db-chip-label">Goal</div><div className="db-chip-value">{goalShort || "—"}</div></div>
              </div>
              {bmi && (
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                  <div className="db-chip" style={{ flex: 1 }}><div className="db-chip-label">BMI</div><div className="db-chip-value">{bmi}</div></div>
                  {healthGoal && <div className="db-chip" style={{ flex: 2 }}><div className="db-chip-label">Health Goal</div><div className="db-chip-value" style={{ fontSize: "0.78rem" }}>{healthGoal}</div></div>}
                </div>
              )}
            </div>

            {/* IKS DIET PLAN */}
            <div className="db-card">
              <div className="db-card-label">Personalized IKS Diet Plan</div>
              <div className="db-diet-header">
                <span className="db-diet-icon">{diet.icon}</span>
                <span className="db-section-title">{diet.title}</span>
                <span className="db-diet-dosha">{prakritiType || prakriti || "General"}</span>
              </div>

              <div className="iks-diet-section">
                <div className="iks-diet-heading iks-eat-head">✅ Eat</div>
                <ul className="db-diet-list">
                  {diet.eat.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div className="iks-diet-section" style={{ marginTop: "1rem" }}>
                <div className="iks-diet-heading iks-avoid-head">❌ Avoid</div>
                <ul className="db-diet-list iks-avoid-list">
                  {diet.avoid.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
