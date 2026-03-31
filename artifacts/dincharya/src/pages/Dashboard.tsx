import { useEffect, useRef, useState } from "react";
import "../pages.css";

const DIET_DATA: Record<string, { icon: string; title: string; items: string[] }> = {
  Vata:  { icon: "🍲", title: "Warm & Grounding Foods", items: ["Warm, cooked meals — soups, stews, and rice","Root vegetables: sweet potato, carrot, beet","Healthy fats: ghee, sesame oil, avocado","Warm herbal teas — ginger, ashwagandha, tulsi","Avoid cold, raw, or dry foods and caffeine"] },
  Pitta: { icon: "🥗", title: "Cooling & Nourishing Foods", items: ["Fresh, cooling fruits — melons, pomegranate, coconut","Leafy greens, cucumber, and zucchini","Dairy: milk, ghee, and unsalted butter","Cooling spices — coriander, fennel, cardamom","Avoid spicy, sour, salty, and fermented foods"] },
  Kapha: { icon: "🥦", title: "Light & Stimulating Foods", items: ["Light grains — millet, barley, quinoa","Pungent vegetables: radish, onion, ginger","Warming spices — black pepper, turmeric, mustard","Light proteins — legumes, chickpeas, lentils","Avoid heavy, oily, sweet, or cold foods"] },
};

function streakBadge(n: number) {
  if (n >= 30) return "MASTER";
  if (n >= 14) return "ADVANCED";
  if (n >= 7)  return "CONSISTENT";
  if (n >= 3)  return "BUILDING";
  return "BEGINNER";
}

interface DailyData { wakeTime: string; sleepTime: string; mealTime: string; screenTime: string; }

export default function Dashboard() {
  const name     = localStorage.getItem("name")     || "";
  const prakriti = localStorage.getItem("prakriti") || "";
  const guna     = localStorage.getItem("guna")     || "";
  const goal     = localStorage.getItem("goal")     || "";
  const firstName = name.split(" ")[0] || "";

  const [streak, setStreak]   = useState(parseInt(localStorage.getItem("streak") || "0", 10));
  const [toast, setToast]     = useState(false);
  const [barW, setBarW]       = useState("0%");
  const [daily, setDaily]     = useState<DailyData>(() => {
    const saved = JSON.parse(localStorage.getItem("dailyData") || "{}");
    return { wakeTime: saved.wakeTime || "", sleepTime: saved.sleepTime || "", mealTime: saved.mealTime || "", screenTime: saved.screenTime || "" };
  });

  useEffect(() => {
    const t = setTimeout(() => setBarW("78%"), 300);
    return () => clearTimeout(t);
  }, []);

  const diet = DIET_DATA[prakriti] || DIET_DATA["Vata"];
  const goalShort = goal.length > 10 ? goal.split(" ")[0] : goal;

  const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  function setField(field: keyof DailyData, value: string) {
    setDaily(d => ({ ...d, [field]: value }));
  }

  function saveData() {
    localStorage.setItem("dailyData", JSON.stringify({ ...daily, savedAt: new Date().toISOString() }));
    const today     = new Date().toDateString();
    const lastSaved = localStorage.getItem("lastSavedDate");
    if (lastSaved !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("streak", String(newStreak));
      localStorage.setItem("lastSavedDate", today);
    }
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

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
                <div className="db-chip"><div className="db-chip-label">Prakriti</div><div className="db-chip-value">{prakriti || "—"}</div></div>
                <div className="db-chip"><div className="db-chip-label">Guna</div><div className="db-chip-value">{guna || "—"}</div></div>
                <div className="db-chip"><div className="db-chip-label">Goal</div><div className="db-chip-value">{goalShort || "—"}</div></div>
              </div>
            </div>

            {/* DIET */}
            <div className="db-card">
              <div className="db-card-label">Personalized Diet</div>
              <div className="db-diet-header">
                <span className="db-diet-icon">{diet.icon}</span>
                <span className="db-section-title">{diet.title}</span>
                <span className="db-diet-dosha">{prakriti || "General"}</span>
              </div>
              <ul className="db-diet-list">
                {diet.items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
