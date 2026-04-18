import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import "../pages.css";

const HEALTH_GOALS = ["Lose Weight", "Gain Muscle", "Maintain"] as const;
type HealthGoal = (typeof HEALTH_GOALS)[number];

function calcBMI(weight: number, height: number) {
  if (!weight || !height) return null;
  return weight / Math.pow(height / 100, 2);
}

function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "#3a7abd" };
  if (bmi < 25)   return { label: "Normal",      color: "#388e3c" };
  return                  { label: "Overweight",  color: "#c06a10" };
}

function calcCalories(weight: number, goal: HealthGoal, weeklyGoal: number) {
  const maintenance = weight * 30;
  const adjustment  = (weeklyGoal * 7700) / 7;
  if (goal === "Lose Weight")  return Math.round(maintenance - adjustment);
  if (goal === "Gain Muscle")  return Math.round(maintenance + adjustment);
  return Math.round(maintenance);
}

export default function Health() {
  const [, navigate]  = useLocation();
  const storedAge     = localStorage.getItem("age") || "";
  const storedWeight  = localStorage.getItem("weight") || "";
  const storedHeight  = localStorage.getItem("height") || "";

  const [age,        setAge]        = useState(storedAge);
  const [height,     setHeight]     = useState(storedHeight);
  const [weight,     setWeight]     = useState(storedWeight);
  const [goal,       setGoal]       = useState<HealthGoal>("Maintain");
  const [weeklyGoal, setWeeklyGoal] = useState(0.5);
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  const bmi = calcBMI(Number(weight), Number(height));
  const bmiCat = bmi ? bmiCategory(bmi) : null;
  const calories = (weight && goal) ? calcCalories(Number(weight), goal, weeklyGoal) : null;

  function validate() {
    const e: Record<string, string> = {};
    const h = Number(height), w = Number(weight), a = Number(age);
    if (!height || isNaN(h) || h < 50 || h > 250) e.height = "Enter a valid height (50–250 cm).";
    if (!weight || isNaN(w) || w < 10 || w > 300) e.weight = "Enter a valid weight (10–300 kg).";
    if (!age    || isNaN(a) || a < 1  || a > 120) e.age    = "Enter a valid age.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const finalBMI      = calcBMI(Number(weight), Number(height))!;
    const dailyCalories = calcCalories(Number(weight), goal, weeklyGoal);
    localStorage.setItem("age",            age);
    localStorage.setItem("height",         height);
    localStorage.setItem("weight",         weight);
    localStorage.setItem("healthGoal",     goal);
    localStorage.setItem("weeklyGoal",     String(weeklyGoal));
    localStorage.setItem("bmi",            finalBMI.toFixed(1));
    localStorage.setItem("dailyCalories",  String(dailyCalories));
    navigate("/dashboard");
  }

  return (
    <div className="ip-body">
      <nav className="ip-navbar">
        <div className="ip-nav-inner">
          <a href="/" className="ip-logo">
            <span className="ip-logo-leaf">🌿</span>
            <span className="ip-logo-text">Dincharya</span>
          </a>
          <a className="ip-back" onClick={() => navigate("/guna")}>← Back</a>
        </div>
      </nav>
      <div className="ip-bg-circle ip-circle-1" />
      <div className="ip-bg-circle ip-circle-2" />

      <main className="auth-main" style={{ alignItems: "flex-start", paddingTop: "2rem" }}>
        <div className="health-wrap">

          {/* LEFT: Form */}
          <div className="auth-card health-card">
            <div className="auth-badge">💪 Health Setup</div>
            <h1 className="auth-title">Your Body Profile</h1>
            <p className="auth-subtitle">We use this to calculate your BMI and personalised daily calorie target.</p>

            <div className="health-two-col">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number" placeholder="e.g. 25" min={1} max={120}
                  className={errors.age ? "is-error" : ""}
                  value={age} onChange={e => { setAge(e.target.value); setErrors(x => ({ ...x, age: "" })); }}
                />
                {errors.age && <span className="field-error">{errors.age}</span>}
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number" placeholder="e.g. 170" min={50} max={250}
                  className={errors.height ? "is-error" : ""}
                  value={height} onChange={e => { setHeight(e.target.value); setErrors(x => ({ ...x, height: "" })); }}
                />
                {errors.height && <span className="field-error">{errors.height}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number" placeholder="e.g. 65" min={10} max={300}
                className={errors.weight ? "is-error" : ""}
                value={weight} onChange={e => { setWeight(e.target.value); setErrors(x => ({ ...x, weight: "" })); }}
              />
              {errors.weight && <span className="field-error">{errors.weight}</span>}
            </div>

            <div className="form-group">
              <label>Health Goal</label>
              <div className="health-goal-grid">
                {HEALTH_GOALS.map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`health-goal-btn${goal === g ? " active" : ""}`}
                    onClick={() => setGoal(g)}
                  >
                    {g === "Lose Weight" ? "⬇️ Lose Weight" : g === "Gain Muscle" ? "⬆️ Gain Muscle" : "⚖️ Maintain"}
                  </button>
                ))}
              </div>
            </div>

            {goal !== "Maintain" && (
              <div className="form-group">
                <label>
                  Weekly Goal — <strong>{weeklyGoal.toFixed(1)} kg/week</strong>
                </label>
                <div className="health-slider-wrap">
                  <span className="slider-min">0</span>
                  <input
                    type="range" min={0} max={1} step={0.1}
                    value={weeklyGoal}
                    onChange={e => setWeeklyGoal(Number(e.target.value))}
                    className="health-slider"
                  />
                  <span className="slider-max">1 kg</span>
                </div>
                <div className="slider-hint">
                  {weeklyGoal <= 0.3 ? "Conservative — sustainable long-term" : weeklyGoal <= 0.6 ? "Moderate — good balance" : "Aggressive — ensure adequate nutrition"}
                </div>
              </div>
            )}

            <button className="btn-primary" onClick={handleSave}>
              Save &amp; Go to Dashboard →
            </button>
          </div>

          {/* Right: Live Stats */}
          <div className="health-stats-col">

            {/* BMI Card */}
            <div className="health-stat-card">
              <div className="hsc-label">Body Mass Index (BMI)</div>
              {bmi ? (
                <>
                  <div className="hsc-value" style={{ color: bmiCat!.color }}>{bmi.toFixed(1)}</div>
                  <div className="hsc-badge" style={{ background: bmiCat!.color + "22", color: bmiCat!.color }}>
                    {bmiCat!.label}
                  </div>
                  <div className="bmi-scale">
                    <div className="bmi-segment bmi-seg-under">Underweight</div>
                    <div className="bmi-segment bmi-seg-normal">Normal</div>
                    <div className="bmi-segment bmi-seg-over">Overweight</div>
                  </div>
                  <div
                    className="bmi-pointer"
                    style={{ left: `${Math.min(Math.max(((bmi - 10) / 30) * 100, 1), 99)}%` }}
                  />
                  <p className="hsc-hint">
                    {bmiCat!.label === "Underweight" && "Consider a nutrient-rich, grounding diet with healthy fats."}
                    {bmiCat!.label === "Normal"       && "Excellent! Maintain with balanced meals and regular movement."}
                    {bmiCat!.label === "Overweight"   && "A light, plant-based Kapha-pacifying diet can help."}
                  </p>
                </>
              ) : (
                <div className="hsc-empty">Enter weight &amp; height to see your BMI</div>
              )}
            </div>

            {/* Calorie Card */}
            <div className="health-stat-card">
              <div className="hsc-label">Daily Calorie Target</div>
              {calories ? (
                <>
                  <div className="hsc-value" style={{ color: "var(--green-600)" }}>{calories.toLocaleString()}</div>
                  <div className="hsc-badge" style={{ background: "var(--green-100)", color: "var(--green-600)" }}>
                    kcal / day
                  </div>
                  <div className="cal-breakdown">
                    <div className="cal-row"><span>Maintenance</span><span>{(Number(weight) * 30).toLocaleString()} kcal</span></div>
                    {goal !== "Maintain" && (
                      <div className="cal-row cal-adj">
                        <span>{goal === "Lose Weight" ? "Deficit" : "Surplus"}</span>
                        <span>{goal === "Lose Weight" ? "−" : "+"}{Math.round((weeklyGoal * 7700) / 7)} kcal</span>
                      </div>
                    )}
                    <div className="cal-row cal-total"><span>Your Target</span><span>{calories.toLocaleString()} kcal</span></div>
                  </div>
                </>
              ) : (
                <div className="hsc-empty">Enter your weight and goal to see calories</div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
