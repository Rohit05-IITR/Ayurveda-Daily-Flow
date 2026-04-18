import { useState } from "react";
import { useLocation } from "wouter";
import "../pages.css";

const QUESTIONS = [
  { text: "How would you describe your body frame?", options: [
    { label: "Thin and lean — hard to gain weight",     dosha: "Vata"  },
    { label: "Medium and muscular — moderate build",    dosha: "Pitta" },
    { label: "Large and sturdy — tend to gain weight",  dosha: "Kapha" },
  ]},
  { text: "How is your digestion?", options: [
    { label: "Irregular — sometimes strong, sometimes weak", dosha: "Vata"  },
    { label: "Strong — I can eat almost anything",           dosha: "Pitta" },
    { label: "Slow — feel heavy after meals",                dosha: "Kapha" },
  ]},
  { text: "How does your skin feel most of the time?", options: [
    { label: "Dry, rough, or flaky",           dosha: "Vata"  },
    { label: "Oily, prone to acne or rashes",   dosha: "Pitta" },
    { label: "Smooth, thick, and cool",          dosha: "Kapha" },
  ]},
  { text: "How would you describe your energy levels?", options: [
    { label: "Variable — bursts of energy then fatigue",   dosha: "Vata"  },
    { label: "Intense and focused but can burn out",       dosha: "Pitta" },
    { label: "Steady and sustained but slow to get going", dosha: "Kapha" },
  ]},
  { text: "How do you react to stress?", options: [
    { label: "Anxiety, worry, or racing thoughts",      dosha: "Vata"  },
    { label: "Irritability, anger, or frustration",     dosha: "Pitta" },
    { label: "Withdrawal, low motivation, or sadness",  dosha: "Kapha" },
  ]},
  { text: "How is your sleep?", options: [
    { label: "Light, interrupted, or hard to fall asleep",     dosha: "Vata"  },
    { label: "Moderate — I sleep well but wake feeling warm",  dosha: "Pitta" },
    { label: "Deep and long — I love to sleep",                dosha: "Kapha" },
  ]},
  { text: "How do you tend to learn and think?", options: [
    { label: "Quick to grasp, quick to forget",             dosha: "Vata"  },
    { label: "Sharp, analytical, and precise",               dosha: "Pitta" },
    { label: "Slow to learn but excellent long-term memory", dosha: "Kapha" },
  ]},
  { text: "How do you typically move and speak?", options: [
    { label: "Fast, restless, and talks quickly",    dosha: "Vata"  },
    { label: "Purposeful, confident, and assertive",  dosha: "Pitta" },
    { label: "Slow, calm, and deliberate",            dosha: "Kapha" },
  ]},
];

const DOSHA_META: Record<string, { icon: string }> = {
  Vata:  { icon: "💨" },
  Pitta: { icon: "🔥" },
  Kapha: { icon: "🌊" },
};

const DUAL_DESC: Record<string, string> = {
  "Vata-Pitta":  "You have a Vata-Pitta constitution — creative and sharp. You thrive with warm, routine-based living, cooling practices, and avoiding extremes of heat and cold.",
  "Vata-Kapha":  "You have a Vata-Kapha constitution — imaginative yet grounded. Balance movement with rest, warmth with lightness, and consistency with spontaneity.",
  "Pitta-Vata":  "You have a Pitta-Vata constitution — driven and quick-thinking. Prioritise calming routines, regular meals, and grounding practices to prevent burnout.",
  "Pitta-Kapha": "You have a Pitta-Kapha constitution — determined and steady. A light, cooling, and stimulating lifestyle helps you maintain balance and vitality.",
  "Kapha-Vata":  "You have a Kapha-Vata constitution — calm and reflective. Regular movement, warming foods, and stimulating mental activity keep you energised.",
  "Kapha-Pitta": "You have a Kapha-Pitta constitution — resilient and focused. Light foods, regular exercise, and cooling practices support your natural strength.",
};

interface PrakritiResult {
  primary: string;
  secondary: string;
  prakritiType: string;
  scores: Record<string, number>;
}

export default function Prakriti() {
  const [, navigate] = useLocation();
  const name = localStorage.getItem("name") || "";
  const firstName = name.split(" ")[0] || "there";

  const [answers, setAnswers]   = useState<Record<number, string>>({});
  const [showError, setShowError] = useState(false);
  const [result, setResult]     = useState<PrakritiResult | null>(null);

  const answered = Object.keys(answers).length;
  const pct = Math.round((answered / QUESTIONS.length) * 100);

  function pick(qi: number, dosha: string) {
    setAnswers(a => ({ ...a, [qi]: dosha }));
    setShowError(false);
  }

  function handleSubmit() {
    if (answered < QUESTIONS.length) { setShowError(true); return; }

    const scores: Record<string, number> = { Vata: 0, Pitta: 0, Kapha: 0 };
    Object.values(answers).forEach(d => scores[d]++);

    const sorted   = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary   = sorted[0][0];
    const secondary = sorted[1][0];
    const prakritiType = `${primary}-${secondary}`;

    localStorage.setItem("prakriti",     primary);
    localStorage.setItem("prakritiType", prakritiType);
    setResult({ primary, secondary, prakritiType, scores });
  }

  if (result) {
    const desc = DUAL_DESC[result.prakritiType] || `Your Prakriti is ${result.prakritiType}.`;
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
              <div className="dual-dosha-icons">
                <span>{DOSHA_META[result.primary].icon}</span>
                <span className="dual-plus">+</span>
                <span>{DOSHA_META[result.secondary].icon}</span>
              </div>
              <div className="result-label-text">Your Dual-Dosha Prakriti</div>
              <div className="result-dosha">{result.prakritiType}</div>
              <div className="dual-dosha-tags">
                <span className={`option-tag tag-${result.primary.toLowerCase()}`} style={{ padding: "0.3rem 0.9rem", fontSize: "0.82rem" }}>Primary: {result.primary}</span>
                <span className={`option-tag tag-${result.secondary.toLowerCase()}`} style={{ padding: "0.3rem 0.9rem", fontSize: "0.82rem" }}>Secondary: {result.secondary}</span>
              </div>
              <p className="result-desc">{desc}</p>
              <div className="score-chips">
                {(["Vata","Pitta","Kapha"] as const).map(d => (
                  <div key={d} className={`score-chip${d === result.primary ? " dominant" : ""}`}>
                    <span className="chip-name">{d}</span>
                    <span className="chip-val">{result.scores[d]}</span>
                  </div>
                ))}
              </div>
              <button className="btn-assess" onClick={() => navigate("/guna")}>Continue to Guna Test →</button>
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
          <a className="ip-back" onClick={() => navigate("/signup")}>← Back</a>
        </div>
      </nav>
      <div className="ip-bg-circle ip-circle-1" />
      <div className="ip-bg-circle ip-circle-2" />
      <main className="assess-main">
        <div className="assess-container">
          <div className="assess-badge">🔬 Prakriti Assessment</div>
          <h1 className="assess-greeting">Namaste, <span>{firstName}</span>! 🙏</h1>
          <p className="assess-sub">Answer 8 questions about your natural tendencies to discover your dual-dosha Ayurvedic constitution.</p>

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
                    key={opt.dosha}
                    className={`option-label${answers[qi] === opt.dosha ? " selected" : ""}`}
                    onClick={() => pick(qi, opt.dosha)}
                  >
                    <span className={`option-radio${answers[qi] === opt.dosha ? " checked" : ""}`} />
                    <span>{opt.label}</span>
                    <span className={`option-tag tag-${opt.dosha.toLowerCase()}`}>{opt.dosha}</span>
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
