import { useState } from "react";
import { useLocation } from "wouter";
import { saveUser } from "../services/api";
import "../pages.css";

const QUESTIONS = [
  { text: "How would you describe your general mindset?", options: [
    { label: "Calm, clear, and content — focused on the present",       guna: "Sattva" },
    { label: "Active and ambitious — always thinking of the next goal",  guna: "Rajas"  },
    { label: "Dull and unmotivated — hard to get started",              guna: "Tamas"  },
  ]},
  { text: "How do you spend most of your free time?", options: [
    { label: "Meditating, reading, or creative activities", guna: "Sattva" },
    { label: "Socialising, planning, or staying busy",       guna: "Rajas"  },
    { label: "Sleeping, watching TV, or doing very little",  guna: "Tamas"  },
  ]},
  { text: "How is your emotional state on most days?", options: [
    { label: "Peaceful, joyful, and equanimous",          guna: "Sattva" },
    { label: "Restless, eager, or slightly anxious",       guna: "Rajas"  },
    { label: "Lethargic, indifferent, or frequently low",  guna: "Tamas"  },
  ]},
  { text: "When you face a challenge, what is your first reaction?", options: [
    { label: "Reflect calmly and seek a balanced solution",        guna: "Sattva" },
    { label: "Jump into action immediately, sometimes impulsively", guna: "Rajas"  },
    { label: "Feel overwhelmed or avoid dealing with it",           guna: "Tamas"  },
  ]},
  { text: "How do you relate to your diet and eating habits?", options: [
    { label: "Fresh, light, wholesome foods — I eat mindfully",         guna: "Sattva" },
    { label: "Spicy, stimulating foods — I eat on the go",               guna: "Rajas"  },
    { label: "Heavy, processed, or leftover foods — I eat without care", guna: "Tamas"  },
  ]},
  { text: "How do you handle your daily responsibilities?", options: [
    { label: "With a balanced routine — consistent and unhurried",  guna: "Sattva" },
    { label: "With urgency — busy, always multi-tasking",            guna: "Rajas"  },
    { label: "Procrastinating or doing the minimum required",        guna: "Tamas"  },
  ]},
  { text: "What best describes your sleep and rest patterns?", options: [
    { label: "Restful and refreshing — wake up feeling energised",  guna: "Sattva" },
    { label: "Light and short — mind keeps running even at night",   guna: "Rajas"  },
    { label: "Excessive — I sleep a lot and still feel tired",        guna: "Tamas"  },
  ]},
  { text: "How do you typically feel about helping or giving to others?", options: [
    { label: "Naturally compassionate — give without expecting return", guna: "Sattva" },
    { label: "Helpful when there is something in it for me",            guna: "Rajas"  },
    { label: "Rarely think about it — self-absorbed or indifferent",    guna: "Tamas"  },
  ]},
];

const GUNA_INFO: Record<string, { icon: string; desc: string }> = {
  Sattva: { icon: "🌟", desc: "Your mind is predominantly Sattvic — clear, harmonious, and peaceful. You tend towards wisdom, compassion, and balance. Nurture this quality through meditation, wholesome food, and purposeful living." },
  Rajas:  { icon: "🔥", desc: "Your mind is predominantly Rajasic — active, ambitious, and restless. You are driven and energetic but may struggle with restlessness. Channel this energy through mindful action and breathwork." },
  Tamas:  { icon: "🌑", desc: "Your mind is predominantly Tamasic — heavy, slow, and inert. This calls for gentle but consistent effort. Sunrise routines, light exercise, and sattvic foods can transform your state gradually." },
};

export default function Guna() {
  const [, navigate] = useLocation();
  const name = localStorage.getItem("name") || "";
  const firstName = name.split(" ")[0] || "there";

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showError, setShowError] = useState(false);
  const [result, setResult] = useState<{ dominant: string; scores: Record<string, number> } | null>(null);

  const answered = Object.keys(answers).length;
  const pct = Math.round((answered / QUESTIONS.length) * 100);

  function pick(qi: number, guna: string) {
    setAnswers(a => ({ ...a, [qi]: guna }));
    setShowError(false);
  }

  async function handleSubmit() {
    if (answered < QUESTIONS.length) { setShowError(true); return; }
    const scores: Record<string, number> = { Sattva: 0, Rajas: 0, Tamas: 0 };
    Object.values(answers).forEach(g => scores[g]++);
    const dominant = Object.keys(scores).reduce((a, b) => scores[a] >= scores[b] ? a : b);

    localStorage.setItem("guna", dominant);

    const email    = localStorage.getItem("email")    || "";
    const prakriti = localStorage.getItem("prakriti") || "";
    if (email) {
      saveUser({ email, prakriti, guna: dominant }).catch(() => {});
    }

    setResult({ dominant, scores });
  }

  if (result) {
    const info = GUNA_INFO[result.dominant];
    return (
      <div className="ip-body">
        <nav className="ip-navbar">
          <div className="ip-nav-inner">
            <a href="/" className="ip-logo"><span className="ip-logo-leaf">🌿</span><span className="ip-logo-text">Dincharya</span></a>
          </div>
        </nav>
        <div className="ip-bg-circle ip-circle-1" />
        <div className="ip-bg-circle ip-circle-2" />
        <main className="assess-main">
          <div className="assess-container">
            <div className="result-card">
              <div className="result-icon">{info.icon}</div>
              <div className="result-label-text">Your Dominant Guna</div>
              <div className="result-dosha">{result.dominant}</div>
              <p className="result-desc">{info.desc}</p>
              <div className="score-chips">
                {(["Sattva","Rajas","Tamas"] as const).map(g => (
                  <div key={g} className={`score-chip${g === result.dominant ? " dominant" : ""}`}>
                    <span className="chip-name">{g}</span>
                    <span className="chip-val">{result.scores[g]}</span>
                  </div>
                ))}
              </div>
              <button className="btn-assess" onClick={() => navigate("/dashboard")}>Go to My Dashboard →</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ip-body">
      <nav className="ip-navbar">
        <div className="ip-nav-inner">
          <a href="/" className="ip-logo"><span className="ip-logo-leaf">🌿</span><span className="ip-logo-text">Dincharya</span></a>
          <a className="ip-back" onClick={() => navigate("/prakriti")}>← Back</a>
        </div>
      </nav>
      <div className="ip-bg-circle ip-circle-1" />
      <div className="ip-bg-circle ip-circle-2" />
      <main className="assess-main">
        <div className="assess-container">
          <div className="assess-badge">🌟 Guna Assessment</div>
          <h1 className="assess-greeting">Namaste, <span>{firstName}</span>! 🙏</h1>
          <p className="assess-sub">Answer 8 questions about your mental tendencies to discover your dominant Guna — the quality of your mind and consciousness.</p>

          <div className="progress-wrap">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="progress-label">{answered} / {QUESTIONS.length}</span>
          </div>

          {QUESTIONS.map((q, qi) => (
            <div key={qi} className="question-card">
              <div className="question-num">Question {qi + 1} of {QUESTIONS.length}</div>
              <div className="question-text">{q.text}</div>
              <div className="options">
                {q.options.map(opt => (
                  <label
                    key={opt.guna}
                    className={`option-label${answers[qi] === opt.guna ? " selected" : ""}`}
                    onClick={() => pick(qi, opt.guna)}
                  >
                    <span className={`option-radio${answers[qi] === opt.guna ? " checked" : ""}`} />
                    <span>{opt.label}</span>
                    <span className={`option-tag tag-${opt.guna.toLowerCase()}`}>{opt.guna}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {showError && (
            <div className="assess-error">⚠️ Please answer all 8 questions before submitting.</div>
          )}

          <button className="btn-assess" onClick={handleSubmit}>Submit →</button>
        </div>
      </main>
    </div>
  );
}
