import { useEffect, useState, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import "../pages.css";
import "./dashboard.css";

/* ════════════════════════════════════
   TYPES
   ════════════════════════════════════ */
interface FoodEntry { name: string; qty: number; cal: number; protein: number; carbs: number; fats: number; }
interface MealItem  { title: string; desc: string; kcal: number; protein: number; }
interface AiPlan {
  title?: string;
  prakriti?: string;
  focus: string;
  breakfast: MealItem[];
  lunch:     MealItem[];
  dinner:    MealItem[];
  snacks:    MealItem[];
  avoid:     string[];
  lifestyle: string[];
}
interface DailyData { wakeTime: string; sleepTime: string; mealTime: string; screenTime: string; }
type MealCat = "breakfast" | "lunch" | "snacks" | "dinner";
interface MealState { log: FoodEntry[]; query: string; qty: number; loading: boolean; error: string; open: boolean; showSug: boolean; }
interface CustomReminder { id: string; title: string; time: string; category: string; done: boolean; }

/* ════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════ */
const MEAL_CONFIG: Record<MealCat, { label: string; icon: string; color: string }> = {
  breakfast: { label: "Breakfast", icon: "🌅", color: "#f97316" },
  lunch:     { label: "Lunch",     icon: "☀️",  color: "#10b981" },
  snacks:    { label: "Snacks",    icon: "🍎",  color: "#8b5cf6" },
  dinner:    { label: "Dinner",    icon: "🌙",  color: "#3b82f6" },
};

const REMINDER_CATS = [
  { value: "meditation", label: "Meditation", icon: "🧘" },
  { value: "workout",    label: "Workout",    icon: "💪" },
  { value: "water",      label: "Water",      icon: "💧" },
  { value: "sleep",      label: "Sleep",      icon: "😴" },
  { value: "journaling", label: "Journaling", icon: "📝" },
  { value: "custom",     label: "Custom",     icon: "✨" },
];

const REM_COLORS: Record<string, string> = {
  meditation: "#8b5cf6", workout: "#ef4444", water: "#3b82f6",
  sleep: "#6366f1", journaling: "#f59e0b", custom: "#10b981",
};

const FOOD_LIST = [
  "rice", "dal", "roti", "chapati", "paneer", "milk", "yogurt", "eggs",
  "chicken breast", "fish curry", "banana", "apple", "orange", "mango",
  "oats", "bread", "butter", "ghee", "almonds", "walnuts", "cashews",
  "spinach", "broccoli", "carrot", "tomato", "potato", "sweet potato",
  "lentils", "chickpeas", "rajma", "moong dal", "idli", "dosa",
  "poha", "upma", "sambar", "biryani", "paratha", "curd", "lassi",
  "100g rice", "2 eggs", "1 cup milk", "1 banana", "100g chicken breast",
  "1 roti", "1 cup dal", "100g paneer", "1 cup oats", "1 apple",
];

const PLAN_MEAL_SECTIONS = [
  { key: "breakfast" as const, label: "Breakfast", icon: "🌅", color: "#f97316" },
  { key: "lunch"     as const, label: "Lunch",     icon: "☀️",  color: "#10b981" },
  { key: "dinner"    as const, label: "Dinner",    icon: "🌙",  color: "#3b82f6" },
  { key: "snacks"    as const, label: "Snacks",    icon: "🍎",  color: "#8b5cf6" },
];

const WEEKLY_SCORE = [
  { day: "Mon", score: 62 }, { day: "Tue", score: 68 }, { day: "Wed", score: 71 },
  { day: "Thu", score: 65 }, { day: "Fri", score: 77 }, { day: "Sat", score: 74 },
  { day: "Sun", score: 78 },
];

/* ════════════════════════════════════
   HELPERS
   ════════════════════════════════════ */
function streakBadge(n: number) {
  if (n >= 30) return "MASTER";
  if (n >= 14) return "ADVANCED";
  if (n >= 7)  return "CONSISTENT";
  if (n >= 3)  return "BUILDING";
  return "BEGINNER";
}
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { text: "Good Morning",   emoji: "☀️" };
  if (h >= 12 && h < 17) return { text: "Good Afternoon", emoji: "🌤️" };
  return { text: "Good Evening", emoji: "🌙" };
}
function blankMeal(open = false): MealState {
  return { log: [], query: "", qty: 1, loading: false, error: "", open, showSug: false };
}

/* ════════════════════════════════════
   MEAL SECTION COMPONENT
   ════════════════════════════════════ */
interface MealSectionProps {
  cat: MealCat;
  state: MealState;
  onChange: (patch: Partial<MealState>) => void;
  onAdd:    (cat: MealCat) => void;
  onRemove: (cat: MealCat, idx: number) => void;
}

function MealSection({ cat, state, onChange, onAdd, onRemove }: MealSectionProps) {
  const cfg    = MEAL_CONFIG[cat];
  const inpRef = useRef<HTMLInputElement>(null);
  const sugRef = useRef<HTMLDivElement>(null);

  const total = useMemo(() => state.log.reduce(
    (s, f) => ({ cal: s.cal + f.cal, p: s.p + f.protein, c: s.c + f.carbs, f: s.f + f.fats }),
    { cal: 0, p: 0, c: 0, f: 0 }
  ), [state.log]);

  const filtered = useMemo(() => {
    if (state.query.length < 2) return [];
    const q = state.query.toLowerCase();
    return FOOD_LIST.filter(f => f.includes(q)).slice(0, 6);
  }, [state.query]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (sugRef.current?.contains(e.target as Node)) return;
      if (inpRef.current?.contains(e.target as Node)) return;
      onChange({ showSug: false });
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [onChange]);

  return (
    <div className="meal-section">
      <button
        className="meal-header"
        onClick={() => onChange({ open: !state.open })}
        style={{ borderLeftColor: cfg.color }}
      >
        <div className="meal-header-left">
          <span className="meal-icon">{cfg.icon}</span>
          <span className="meal-label">{cfg.label}</span>
          {state.log.length > 0 && (
            <span className="meal-count">{state.log.length} item{state.log.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <div className="meal-header-right">
          {total.cal > 0 && (
            <span className="meal-cal-badge" style={{ color: cfg.color }}>{total.cal} kcal</span>
          )}
          <motion.span
            className="meal-chevron"
            animate={{ rotate: state.open ? 180 : 0 }}
            transition={{ duration: 0.22 }}
          >▾</motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {state.open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="meal-body">
              <div className="cal-add-row" style={{ position: "relative" }}>
                <div className="cal-input-wrap">
                  <span className="cal-input-icon">🍽️</span>
                  <input
                    ref={inpRef}
                    type="text"
                    placeholder="e.g. 100g rice, 2 eggs, 1 cup dal"
                    value={state.query}
                    onChange={e => onChange({ query: e.target.value, error: "", showSug: true })}
                    onFocus={() => onChange({ showSug: true })}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !state.loading) onAdd(cat);
                      if (e.key === "Escape") onChange({ showSug: false });
                    }}
                    className="cal-food-input"
                    disabled={state.loading}
                  />
                  <AnimatePresence>
                    {state.showSug && filtered.length > 0 && (
                      <motion.div
                        ref={sugRef}
                        className="ac-dropdown"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        {filtered.map(s => (
                          <button
                            key={s}
                            className="ac-item"
                            onMouseDown={e => {
                              e.preventDefault();
                              onChange({ query: s, showSug: false });
                              setTimeout(() => inpRef.current?.focus(), 0);
                            }}
                          >
                            <span className="ac-icon">🔍</span>
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input
                  type="number" min={0.5} step={0.5} value={state.qty}
                  onChange={e => onChange({ qty: Number(e.target.value) })}
                  className="cal-qty-input" title="Serving multiplier" disabled={state.loading}
                />
                <button
                  className="cal-add-btn"
                  onClick={() => onAdd(cat)}
                  disabled={state.loading || !state.query.trim()}
                >
                  {state.loading ? <span className="cal-btn-spin" /> : <><span>+</span> Add</>}
                </button>
              </div>

              {state.error && <p className="cal-error">{state.error}</p>}

              {state.log.length > 0 ? (
                <>
                  <div className="cal-log">
                    <AnimatePresence>
                      {state.log.map((entry, i) => (
                        <motion.div
                          key={`${entry.name}-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          className="cal-log-row"
                        >
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
                          <button className="cal-remove" onClick={() => onRemove(cat, i)}>✕</button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="meal-subtotal">
                    <span className="meal-sub-lbl">Meal Total</span>
                    <div className="meal-sub-macros">
                      <span style={{ color: "#10b981", fontWeight: 700 }}>{total.cal} kcal</span>
                      <span style={{ color: "#3b82f6" }}>P {total.p.toFixed(1)}g</span>
                      <span style={{ color: "#f59e0b" }}>C {total.c.toFixed(1)}g</span>
                      <span style={{ color: "#ef4444" }}>F {total.f.toFixed(1)}g</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="meal-empty">No items logged for this meal</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════
   CUSTOM REMINDERS COMPONENT
   ════════════════════════════════════ */
function CustomReminders() {
  const [reminders, setReminders] = useState<CustomReminder[]>(() =>
    JSON.parse(localStorage.getItem("customReminders") || "[]")
  );
  const [title,    setTitle]    = useState("");
  const [time,     setTime]     = useState("");
  const [category, setCategory] = useState("meditation");

  function persist(list: CustomReminder[]) {
    setReminders(list);
    localStorage.setItem("customReminders", JSON.stringify(list));
  }
  function add() {
    if (!title.trim()) return;
    persist([...reminders, { id: `${Date.now()}`, title: title.trim(), time, category, done: false }]);
    setTitle(""); setTime("");
  }
  function toggle(id: string) { persist(reminders.map(r => r.id === id ? { ...r, done: !r.done } : r)); }
  function remove(id: string) { persist(reminders.filter(r => r.id !== id)); }

  const catInfo = (v: string) => REMINDER_CATS.find(c => c.value === v) ?? REMINDER_CATS[REMINDER_CATS.length - 1];

  return (
    <>
      <div className="db-card-label">Custom Habit Reminders</div>
      <div className="db-section-title" style={{ marginBottom: "1rem" }}>Daily Wellness Habits</div>

      <div className="rem-add-form">
        <input
          className="rem-input"
          type="text"
          placeholder="e.g. Morning meditation, Evening walk…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          maxLength={60}
        />
        <div className="rem-add-row">
          <input className="rem-time-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
          <select className="rem-select" value={category} onChange={e => setCategory(e.target.value)}>
            {REMINDER_CATS.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
          <button className="rem-add-btn" onClick={add} disabled={!title.trim()}>+</button>
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="rem-empty"><span>🌱</span><p>Add your first habit reminder above</p></div>
      ) : (
        <div className="rem-list">
          <AnimatePresence>
            {reminders.map(r => {
              const info  = catInfo(r.category);
              const color = REM_COLORS[r.category] || "#10b981";
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22 }}
                  className={`rem-item${r.done ? " rem-item--done" : ""}`}
                  style={{ borderLeftColor: color }}
                >
                  <button
                    className={`rem-check${r.done ? " rem-check--on" : ""}`}
                    style={r.done ? { background: color, borderColor: color } : { borderColor: color }}
                    onClick={() => toggle(r.id)}
                    aria-label="Toggle complete"
                  >
                    {r.done && "✓"}
                  </button>
                  <div className="rem-icon-wrap" style={{ background: `${color}18`, color }}>
                    {info.icon}
                  </div>
                  <div className="rem-info">
                    <span className="rem-title">{r.title}</span>
                    <div className="rem-meta">
                      <span className="rem-cat" style={{ color }}>{info.label}</span>
                      {r.time && <span className="rem-time">· {r.time}</span>}
                    </div>
                  </div>
                  <button className="rem-delete" onClick={() => remove(r.id)} aria-label="Delete">✕</button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════ */
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
  const [toast,   setToast]   = useState<string | null>(null);
  const [barW,    setBarW]    = useState("0%");
  const [mounted, setMounted] = useState(false);

  const [daily, setDaily] = useState<DailyData>(() => {
    const s = JSON.parse(localStorage.getItem("dailyData") || "{}");
    return { wakeTime: s.wakeTime || "", sleepTime: s.sleepTime || "", mealTime: s.mealTime || "", screenTime: s.screenTime || "" };
  });

  const [meals, setMeals] = useState<Record<MealCat, MealState>>({
    breakfast: blankMeal(true),
    lunch:     blankMeal(),
    snacks:    blankMeal(),
    dinner:    blankMeal(),
  });

  const [aiPlan,       setAiPlan]       = useState<AiPlan | null>(null);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiError,      setAiError]      = useState("");
  const [planSections, setPlanSections] = useState({ eat: true, avoid: false, life: false });

  // Ref for always-fresh meals in addFood async closure
  const mealsRef = useRef(meals);
  mealsRef.current = meals;

  useEffect(() => {
    const t1 = setTimeout(() => setBarW("78%"), 500);
    const t2 = setTimeout(() => setMounted(true), 60);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  /* ── Derived totals ── */
  const allFood      = useMemo(() => (Object.values(meals) as MealState[]).flatMap(m => m.log), [meals]);
  const totalCal     = useMemo(() => allFood.reduce((s, f) => s + f.cal, 0), [allFood]);
  const totalProtein = useMemo(() => allFood.reduce((s, f) => s + f.protein, 0), [allFood]);
  const totalCarbs   = useMemo(() => allFood.reduce((s, f) => s + f.carbs, 0), [allFood]);
  const totalFats    = useMemo(() => allFood.reduce((s, f) => s + f.fats, 0), [allFood]);
  const remaining    = dailyCalories ? dailyCalories - totalCal : null;
  const calPct       = dailyCalories ? Math.min((totalCal / dailyCalories) * 100, 100) : 0;

  const macroData = useMemo(() => allFood.length > 0 ? [
    { name: "Protein", value: Math.round(totalProtein), color: "#3b82f6" },
    { name: "Carbs",   value: Math.round(totalCarbs),   color: "#10b981" },
    { name: "Fats",    value: Math.round(totalFats),    color: "#f59e0b" },
  ] : [], [allFood.length, totalProtein, totalCarbs, totalFats]);

  /* ── Meal helpers ── */
  function patchMeal(cat: MealCat, patch: Partial<MealState>) {
    setMeals(m => ({ ...m, [cat]: { ...m[cat], ...patch } }));
  }

  async function addFood(cat: MealCat) {
    const state = mealsRef.current[cat];
    const query = state.query.trim();
    if (!query) return;
    setMeals(m => ({ ...m, [cat]: { ...m[cat], loading: true, error: "", showSug: false } }));
    try {
      const res  = await fetch(`/api/nutrition?food=${encodeURIComponent(query)}`);
      const data = await res.json() as {
        items?: { name: string; calories: number; protein_g: number; carbohydrates_total_g: number; fat_total_g: number }[]
      };
      if (!res.ok || !data.items || data.items.length === 0) {
        setMeals(m => ({ ...m, [cat]: { ...m[cat], loading: false, error: `"${query}" not found. Try a specific name (e.g. '100g rice').` } }));
        return;
      }
      const item  = data.items[0];
      const scale = state.qty;
      const entry: FoodEntry = {
        name:    item.name,
        qty:     state.qty,
        cal:     Math.round(item.calories * scale),
        protein: Math.round(item.protein_g * scale * 10) / 10,
        carbs:   Math.round(item.carbohydrates_total_g * scale * 10) / 10,
        fats:    Math.round(item.fat_total_g * scale * 10) / 10,
      };
      setMeals(m => ({ ...m, [cat]: { ...m[cat], log: [...m[cat].log, entry], query: "", qty: 1, loading: false, error: "" } }));
    } catch {
      setMeals(m => ({ ...m, [cat]: { ...m[cat], loading: false, error: "Network error. Please try again." } }));
    }
  }

  function removeFood(cat: MealCat, idx: number) {
    setMeals(m => ({ ...m, [cat]: { ...m[cat], log: m[cat].log.filter((_, i) => i !== idx) } }));
  }

  /* ── AI plan ── */
  async function generateDietPlan() {
    setAiLoading(true);
    setAiError("");
    const todayDate = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    try {
      const res = await fetch("/api/diet-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prakritiType:     prakritiType || prakriti || "Vata-Pitta",
          goal:             healthGoal || goal || "General Wellness",
          bmi:              bmi || "—",
          dailyCalories,
          consumedCalories: totalCal,
          todayDate,
        }),
      });
      const data = await res.json() as AiPlan & { error?: string };
      if (!res.ok || data.error) { setAiError("Failed to generate plan. Please try again."); return; }
      setAiPlan(data);
      setPlanSections({ eat: true, avoid: false, life: false });
    } catch {
      setAiError("Network error. Please check your connection.");
    } finally {
      setAiLoading(false);
    }
  }

  /* ── Daily log ── */
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
    showToast("✅ Data saved! Your streak has been updated.");
  }

  const { text: greetText, emoji: greetEmoji } = getGreeting();
  const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  /* ════════════════════════════════════
     RENDER
     ════════════════════════════════════ */
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

          {/* ════ LEFT COLUMN ════ */}
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

            {/* CALORIE TRACKER — 4 MEAL SECTIONS */}
            <div className="db-card db-lift">
              <div className="db-card-label">Calorie Tracker</div>
              <div className="db-section-title" style={{ marginBottom: "0.9rem" }}>Log Your Meals</div>

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

              <div className="meals-wrap">
                {(Object.keys(MEAL_CONFIG) as MealCat[]).map(cat => (
                  <MealSection
                    key={cat}
                    cat={cat}
                    state={meals[cat]}
                    onChange={patch => patchMeal(cat, patch)}
                    onAdd={addFood}
                    onRemove={removeFood}
                  />
                ))}
              </div>

              {allFood.length > 0 && (
                <>
                  <div className="cal-totals" style={{ marginTop: "1rem" }}>
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
              <AnimatePresence>
                {toast && (
                  <motion.div
                    className="db-toast"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {toast}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* ════ RIGHT COLUMN ════ */}
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

            {/* AI DIET PLAN — REDESIGNED */}
            <div className="db-card db-lift db-ai-card">
              <div className="db-card-label">Personalized IKS Diet Plan</div>

              {aiLoading ? (
                <div className="ai-skeleton">
                  <div className="skel skel-title" />
                  <div className="skel skel-badge" />
                  <div className="skel skel-head" />
                  <div className="skel skel-line" /><div className="skel skel-line skel--s" />
                  <div className="skel skel-line" />
                  <div className="skel skel-head" style={{ marginTop: "0.9rem" }} />
                  <div className="skel skel-line" /><div className="skel skel-line skel--s" />
                  <p className="ai-skel-label">✨ Generating your personalised plan…</p>
                </div>
              ) : !aiPlan ? (
                <div className="ai-plan-empty">
                  <div className="ai-plan-icon">🤖</div>
                  <div className="ai-plan-title-text">Your AI Wellness Coach</div>
                  <p className="ai-plan-hint">
                    Get a personalised Ayurvedic diet plan powered by Gemini AI — tailored to your Prakriti, BMI, health goal, and today's nutrition.
                  </p>
                  {aiError && <p className="cal-error" style={{ marginBottom: "0.9rem" }}>{aiError}</p>}
                  <button className="ai-gen-btn" onClick={generateDietPlan} disabled={aiLoading}>
                    ✨ Generate My Plan
                  </button>
                </div>
              ) : (
                <>
                  {/* TODAY'S FOCUS */}
                  {aiPlan.focus && (
                    <div className="ai-focus-bar">
                      <span className="ai-focus-star">✨</span>
                      <span className="ai-focus-text">{aiPlan.focus}</span>
                    </div>
                  )}

                  {/* STICKY HEADER */}
                  <div className="ai-plan-sticky-head">
                    <div>
                      {aiPlan.title && <div className="ai-plan-theme">{aiPlan.title}</div>}
                      {aiPlan.prakriti && <span className="db-diet-dosha">{aiPlan.prakriti}</span>}
                    </div>
                    <button className="ai-regen-btn" onClick={generateDietPlan} disabled={aiLoading} title="Regenerate plan">↻</button>
                  </div>

                  {/* SCROLLABLE BODY */}
                  <div className="ai-plan-scroll-body">

                    {/* EAT TODAY — COLLAPSIBLE */}
                    <div className="ai-collap-section">
                      <button
                        className="ai-collap-toggle ai-collap-toggle--eat"
                        onClick={() => setPlanSections(s => ({ ...s, eat: !s.eat }))}
                      >
                        <span className="ai-collap-icon">🥗</span>
                        <span className="ai-collap-label">Eat Today</span>
                        <motion.span className="ai-collap-chevron"
                          animate={{ rotate: planSections.eat ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >▾</motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {planSections.eat && (
                          <motion.div
                            key="eat"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="ai-eat-body">
                              {PLAN_MEAL_SECTIONS.map(ms => {
                                const items = aiPlan[ms.key];
                                if (!items?.length) return null;
                                return (
                                  <div key={ms.key} className="ai-meal-group">
                                    <div className="ai-meal-group-lbl" style={{ color: ms.color }}>
                                      <span>{ms.icon}</span>{ms.label}
                                    </div>
                                    {items.map((item, i) => (
                                      <div key={i} className="ai-meal-card" style={{ borderLeftColor: ms.color }}>
                                        <div className="ai-meal-card-inner">
                                          <div className="ai-meal-card-title">{item.title}</div>
                                          {item.desc && <div className="ai-meal-card-desc">{item.desc}</div>}
                                        </div>
                                        <div className="ai-meal-card-macros">
                                          {item.kcal > 0 && <span className="ai-macro-kcal">{item.kcal} kcal</span>}
                                          {item.protein > 0 && <span className="ai-macro-prot">{item.protein}g P</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* AVOID — COLLAPSIBLE */}
                    {aiPlan.avoid?.length > 0 && (
                      <div className="ai-collap-section">
                        <button
                          className="ai-collap-toggle ai-collap-toggle--avoid"
                          onClick={() => setPlanSections(s => ({ ...s, avoid: !s.avoid }))}
                        >
                          <span className="ai-collap-icon">🚫</span>
                          <span className="ai-collap-label">Avoid Today</span>
                          <span className="ai-avoid-count">{aiPlan.avoid.length}</span>
                          <motion.span className="ai-collap-chevron"
                            animate={{ rotate: planSections.avoid ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >▾</motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {planSections.avoid && (
                            <motion.div
                              key="avoid"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                              style={{ overflow: "hidden" }}
                            >
                              <div className="ai-pill-body">
                                {aiPlan.avoid.map(item => (
                                  <span key={item} className="ai-avoid-pill">{item}</span>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* LIFESTYLE — COLLAPSIBLE */}
                    {aiPlan.lifestyle?.length > 0 && (
                      <div className="ai-collap-section">
                        <button
                          className="ai-collap-toggle ai-collap-toggle--life"
                          onClick={() => setPlanSections(s => ({ ...s, life: !s.life }))}
                        >
                          <span className="ai-collap-icon">🧘</span>
                          <span className="ai-collap-label">Lifestyle</span>
                          <motion.span className="ai-collap-chevron"
                            animate={{ rotate: planSections.life ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >▾</motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {planSections.life && (
                            <motion.div
                              key="life"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                              style={{ overflow: "hidden" }}
                            >
                              <div className="ai-life-body">
                                {aiPlan.lifestyle.map((item, i) => (
                                  <div key={i} className="ai-life-item">
                                    <span className="ai-life-dot" />
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {aiError && <p className="cal-error" style={{ marginTop: "0.5rem" }}>{aiError}</p>}
                  </div>
                </>
              )}
            </div>

            {/* CUSTOM REMINDERS */}
            <div className="db-card db-lift">
              <CustomReminders />
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
