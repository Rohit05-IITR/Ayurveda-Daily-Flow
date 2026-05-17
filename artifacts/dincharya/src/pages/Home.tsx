import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import "./home.css";

/* ── Helpers ── */
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Counter({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    let t0: number;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return (
    <div className="stat" ref={ref}>
      <span className="stat-number">{n.toLocaleString()}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ── Particles data ── */
const PARTICLES = [
  { e: "🍃", x: "12%",  y: "18%",  dx: 10,  dur: 4.2, delay: 0   },
  { e: "🌿", x: "82%",  y: "12%",  dx: -8,  dur: 5.1, delay: 0.7 },
  { e: "✨", x: "74%",  y: "72%",  dx: 6,   dur: 3.4, delay: 1.4 },
  { e: "🍂", x: "8%",   y: "66%",  dx: 12,  dur: 4.8, delay: 0.4 },
  { e: "💫", x: "88%",  y: "42%",  dx: -10, dur: 3.1, delay: 2.1 },
  { e: "🌸", x: "44%",  y: "88%",  dx: 8,   dur: 5.3, delay: 1.0 },
  { e: "🍀", x: "20%",  y: "45%",  dx: -6,  dur: 4.0, delay: 1.8 },
];

/* ── AI recommendation cards data ── */
const AI_CARDS = [
  {
    icon: "🥗",
    title: "Today's Diet — Vata-Pitta",
    items: ["Warm kitchari with ghee", "Avoid cold, raw foods", "Cumin & turmeric spices"],
    color: "#e8f5e9",
    border: "#a5d6a7",
  },
  {
    icon: "📊",
    title: "Wellness Insight",
    items: ["Score up 15% vs last week", "Sleep improved by 40 min", "Streak: 12 days 🔥"],
    color: "#e3f2fd",
    border: "#90caf9",
  },
  {
    icon: "🧘",
    title: "Lifestyle Guidance",
    items: ["Wake by 6 AM — Brahma Muhurta", "10-min Pranayama after rising", "Abhyanga self-massage tonight"],
    color: "#fff3e0",
    border: "#ffcc80",
  },
];

const TESTIMONIALS = [
  {
    avatar: "👩‍⚕️",
    name: "Priya Sharma",
    role: "Yoga Instructor, Pune",
    text: "Dincharya helped me understand my Vata imbalance. The AI diet plan is spot-on — I feel energised for the first time in years.",
    stars: 5,
  },
  {
    avatar: "👨‍💻",
    name: "Rohan Mehta",
    role: "Software Engineer, Bengaluru",
    text: "I love the calorie tracker combined with Ayurvedic wisdom. It's the only app that actually connects nutrition with my body type.",
    stars: 5,
  },
  {
    avatar: "👩‍🎓",
    name: "Ananya Iyer",
    role: "Research Scholar, IIT Roorkee",
    text: "Scientifically grounded yet rooted in tradition. The Prakriti assessment is remarkably accurate. This is the future of wellness.",
    stars: 5,
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="dincharya-app">

      {/* ══════════ NAVBAR ══════════ */}
      <motion.nav
        className={`navbar${scrolled ? " navbar-scrolled" : ""}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-leaf">🌿</span>
            <span className="logo-text">Dincharya</span>
          </div>
          <ul className={`nav-links${menuOpen ? " nav-open" : ""}`}>
            <li><a href="#home"     onClick={() => setMenuOpen(false)}>Home</a></li>
            <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
            <li><a href="#how"      onClick={() => setMenuOpen(false)}>How It Works</a></li>
            <li>
              <a href="/signup" className="nav-cta"
                onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate("/signup"); }}>
                Get Started
              </a>
            </li>
          </ul>
          <button className="hamburger" aria-label="Toggle menu" onClick={() => setMenuOpen(v => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </motion.nav>

      {/* ══════════ HERO ══════════ */}
      <section className="hero" id="home">
        <div className="hero-blobs">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-blob hero-blob-3" />
        </div>

        {/* LEFT */}
        <div className="hero-content">
          <motion.div className="hero-badge"
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}>
            🌅 Ancient Wisdom · Modern Science
          </motion.div>

          <motion.h1 className="hero-title"
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            Live in Harmony with<br />
            <span className="hero-highlight">Natural Rhythms</span>
          </motion.h1>

          <motion.p className="hero-tagline"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.48, duration: 0.6 }}>
            Align your lifestyle with Ayurvedic wisdom, AI-powered nutrition,<br className="hide-mobile" />
            and personalised daily routines — built just for you.
          </motion.p>

          <motion.div className="hero-buttons"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.6 }}>
            <button className="btn btn-primary btn-glow" onClick={() => navigate("/signup")}>
              <span>Get Started</span>
              <motion.span className="btn-arrow"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                →
              </motion.span>
            </button>
            <button className="btn btn-glass" onClick={() => navigate("/prakriti")}>
              🔬 Take Prakriti Test
            </button>
          </motion.div>

          <motion.div className="hero-stats"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}>
            <Counter target={5000} suffix="+" label="Years of Wisdom" />
            <div className="stat-divider" />
            <Counter target={3} label="Doshas Balanced" />
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number stat-inf">∞</span>
              <span className="stat-label">Wellness Potential</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Animated Visual */}
        <motion.div className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>

          {/* Ambient background glow */}
          <div className="vis-ambient" />

          {/* Rotating rings */}
          <motion.div className="vis-ring vis-ring--outer"
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }} />
          <motion.div className="vis-ring vis-ring--mid"
            animate={{ rotate: -360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }} />
          <motion.div className="vis-ring vis-ring--inner"
            animate={{ rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }} />

          {/* Central breathing orb */}
          <motion.div className="vis-orb"
            animate={{
              scale: [1, 1.07, 1],
              boxShadow: [
                "0 0 40px rgba(74,181,74,0.28), 0 0 90px rgba(74,181,74,0.10)",
                "0 0 72px rgba(74,181,74,0.50), 0 0 140px rgba(74,181,74,0.18)",
                "0 0 40px rgba(74,181,74,0.28), 0 0 90px rgba(74,181,74,0.10)",
              ],
            }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}>
            <motion.span
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: "2.6rem", display: "block", lineHeight: 1 }}>
              ☀️
            </motion.span>
          </motion.div>

          {/* Floating particles */}
          <div className="vis-particles">
            {PARTICLES.map((p, i) => (
              <motion.span key={i} className="vis-particle"
                style={{ left: p.x, top: p.y }}
                animate={{ y: [0, -18, 0], x: [0, p.dx, 0], opacity: [0.45, 0.9, 0.45] }}
                transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}>
                {p.e}
              </motion.span>
            ))}
          </div>

          {/* Floating info chips */}
          <motion.div className="vis-chip vis-chip-1"
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
            🌿 Vata-Pitta · Balanced
          </motion.div>
          <motion.div className="vis-chip vis-chip-2"
            animate={{ y: [0, -11, 0] }}
            transition={{ duration: 4.0, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}>
            🔥 12-Day Streak
          </motion.div>
          <motion.div className="vis-chip vis-chip-3"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}>
            📊 Score: 78%
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════ WAVE ══════════ */}
      <div className="home-wave home-wave--beige">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="#fef8f0" />
        </svg>
      </div>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="how-it-works" id="how">
        <div className="section-container">
          <FadeUp>
            <div className="section-label">Simple Process</div>
            <h2 className="section-title">How Dincharya Works</h2>
            <p className="section-subtitle">
              Three steps to align your daily routine with Ayurvedic principles
            </p>
          </FadeUp>
          <div className="steps-grid">
            {[
              { n: "01", icon: "🧬", title: "Know Yourself", desc: "Discover your unique Prakriti (body constitution) and Guna (mental tendencies) through our guided assessment.", tags: ["Prakriti", "Guna"] },
              { n: "02", icon: "📋", title: "Get Personalised Plan", desc: "Receive a tailored Dinacharya with AI-powered diet recommendations, habits, and lifestyle practices suited to you.", tags: ["Diet", "Dinacharya"] },
              { n: "03", icon: "📊", title: "Track & Improve", desc: "Monitor daily habits, view wellness charts on your dashboard, and grow week by week with streak tracking.", tags: ["Dashboard", "Insights"] },
            ].map((s, i) => (
              <FadeUp key={s.n} delay={i * 0.15} className="step-card-wrap">
                <motion.div className="step-card" whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(74,181,74,0.14)" }}>
                  <div className="step-num-badge">{s.n}</div>
                  <div className="step-icon-wrap">
                    <span className="step-icon">{s.icon}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <div className="step-tags">
                    {s.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </motion.div>
                {i < 2 && <div className="step-arrow">→</div>}
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ WAVE ══════════ */}
      <div className="home-wave home-wave--white">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,30 C480,64 960,0 1440,30 L1440,64 L0,64 Z" fill="white" />
        </svg>
      </div>

      {/* ══════════ DASHBOARD PREVIEW ══════════ */}
      <section className="dp-section">
        <div className="section-container">
          <FadeUp className="dp-heading">
            <div className="section-label">See It In Action</div>
            <h2 className="section-title">Your Personalised Wellness Dashboard</h2>
            <p className="section-subtitle">
              Everything you need to track, improve, and sustain your Ayurvedic lifestyle — beautifully visualised.
            </p>
          </FadeUp>

          <div className="dp-wrap">
            {/* Main mockup card */}
            <FadeUp delay={0.2} className="dp-mockup-wrap">
              <div className="dp-mockup">
                {/* Mock header */}
                <div className="dp-mock-header">
                  <div className="dp-mock-brand">🌿 Dincharya</div>
                  <div className="dp-mock-date">Sun, 17 May</div>
                </div>
                <div className="dp-mock-greeting">Good Morning, Arjun! ☀️</div>
                <div className="dp-mock-body">
                  {/* Score + Streak row */}
                  <div className="dp-mock-row">
                    <div className="dp-mock-card dp-mock-score">
                      <div className="dp-mock-lbl">DINACHARYA SCORE</div>
                      <div className="dp-mock-big">78<span>%</span></div>
                      <div className="dp-mock-bar-track"><div className="dp-mock-bar-fill" style={{ width: "78%" }} /></div>
                    </div>
                    <div className="dp-mock-card dp-mock-streak">
                      <div className="dp-mock-lbl">DAY STREAK</div>
                      <div className="dp-mock-big" style={{ color: "#d97706" }}>🔥 12</div>
                      <div className="dp-mock-badge-sm">CONSISTENT</div>
                    </div>
                  </div>
                  {/* Mini chart */}
                  <div className="dp-mock-card dp-mock-chart-card">
                    <div className="dp-mock-lbl">WEEKLY TREND</div>
                    <div className="dp-mini-chart">
                      {[62, 68, 71, 65, 77, 74, 78].map((v, i) => (
                        <div key={i} className="dp-mini-bar-wrap">
                          <div className="dp-mini-bar" style={{ height: `${(v - 55) * 2.8}px`, background: i === 6 ? "#2d8a2d" : "#a7d7a7" }} />
                          <span className="dp-mini-day">{["M","T","W","T","F","S","S"][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* AI Plan snippet */}
                  <div className="dp-mock-card dp-mock-ai">
                    <div className="dp-mock-ai-head">
                      <span className="dp-mock-ai-badge">✨ AI Plan</span>
                      <span className="dp-mock-dosha-tag">Vata-Pitta</span>
                    </div>
                    <div className="dp-mock-ai-items">
                      <span>✦ Warm kitchari with ghee</span>
                      <span>✦ Avoid cold, raw foods today</span>
                      <span>✦ Pranayama after sunrise</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Floating accent cards */}
            <motion.div className="dp-float dp-float-1"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
              <div className="dp-float-icon">🤖</div>
              <div>
                <div className="dp-float-title">AI Plan Ready</div>
                <div className="dp-float-sub">Personalised for Vata-Pitta</div>
              </div>
            </motion.div>
            <motion.div className="dp-float dp-float-2"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
              <div className="dp-float-icon">🥗</div>
              <div>
                <div className="dp-float-title">1,240 / 2,100 kcal</div>
                <div className="dp-float-sub">860 remaining today</div>
              </div>
            </motion.div>
            <motion.div className="dp-float dp-float-3"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
              <div className="dp-float-icon">📈</div>
              <div>
                <div className="dp-float-title">+15% this week</div>
                <div className="dp-float-sub">Great consistency!</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ AI INTELLIGENCE SECTION ══════════ */}
      <section className="ai-sec">
        <div className="ai-sec-glow ai-sec-glow-1" />
        <div className="ai-sec-glow ai-sec-glow-2" />
        <div className="section-container">
          <div className="ai-sec-grid">
            {/* LEFT */}
            <FadeUp>
              <div className="section-label ai-sec-label">Powered by Gemini AI</div>
              <h2 className="section-title ai-sec-title">✨ AI-Powered Ayurvedic Intelligence</h2>
              <p className="ai-sec-desc">
                Our Gemini-powered engine combines 5,000 years of Ayurvedic knowledge with modern nutritional science to give you a completely personalised wellness experience — adapting in real time to your body, goals, and daily data.
              </p>
              <div className="ai-feat-list">
                {[
                  { icon: "🧬", title: "Prakriti Intelligence", desc: "Deep analysis of your Vata, Pitta, and Kapha balance to understand your unique constitution." },
                  { icon: "🥗", title: "Smart Nutrition", desc: "Real-time calorie tracking fused with Ayurvedic food recommendations tailored to your dosha." },
                  { icon: "📊", title: "Adaptive Planning", desc: "Your daily plan evolves as you log more data — improving accuracy with every interaction." },
                  { icon: "🔮", title: "Pattern Recognition", desc: "AI identifies your wellness patterns and highlights which habits drive your highest scores." },
                ].map(({ icon, title, desc }, i) => (
                  <FadeUp key={title} delay={i * 0.12}>
                    <motion.div className="ai-feat-item" whileHover={{ x: 6 }}>
                      <div className="ai-feat-icon">{icon}</div>
                      <div>
                        <div className="ai-feat-title">{title}</div>
                        <div className="ai-feat-desc">{desc}</div>
                      </div>
                    </motion.div>
                  </FadeUp>
                ))}
              </div>
              <button className="btn btn-ai-cta" onClick={() => navigate("/signup")}>
                Try AI Wellness Coach →
              </button>
            </FadeUp>

            {/* RIGHT — floating AI recommendation cards */}
            <div className="ai-cards-wrap">
              {AI_CARDS.map((card, i) => (
                <FadeUp key={card.title} delay={i * 0.18}>
                  <motion.div
                    className="ai-reco-card"
                    style={{ background: card.color, borderColor: card.border }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    animate={{ y: [0, i % 2 === 0 ? -6 : -8, 0] }}
                    transition={{
                      y: { duration: 3.5 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 },
                    }}
                  >
                    <div className="ai-reco-head">
                      <span>{card.icon}</span>
                      <span>{card.title}</span>
                    </div>
                    <ul className="ai-reco-items">
                      {card.items.map(it => <li key={it}>{it}</li>)}
                    </ul>
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ WAVE ══════════ */}
      <div className="home-wave home-wave--faint">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,20 C360,64 1080,0 1440,44 L1440,64 L0,64 Z" fill="#fafdf7" />
        </svg>
      </div>

      {/* ══════════ FEATURES ══════════ */}
      <section className="features" id="features">
        <div className="section-container">
          <FadeUp>
            <div className="section-label">What We Offer</div>
            <h2 className="section-title">Features Built for You</h2>
            <p className="section-subtitle">
              Everything you need to begin and sustain your Ayurvedic wellness journey
            </p>
          </FadeUp>
          <div className="features-grid">
            {[
              { icon: "🌿", title: "Dinacharya Score", desc: "Track how well you follow your daily Ayurvedic routine. Get a wellness score that reflects your consistency and balance throughout the day.", pill: "Daily Score", large: true },
              { icon: "🥗", title: "Personalized Diet", desc: "Food recommendations based on your Prakriti, season, and current imbalances.", pill: "Nutrition" },
              { icon: "🔥", title: "Habit Streaks", desc: "Build lasting habits with streaks, milestones, and gentle daily reminders.", pill: "Consistency" },
              { icon: "📈", title: "Weekly Insights", desc: "Deep-dive reports on your energy, mood, digestion, and overall wellness trends.", pill: "Analytics" },
              { icon: "🔔", title: "Smart Reminders", desc: "Get timely, Ayurveda-aware nudges — morning rituals, meal timing, Abhyanga, meditation, and more.", pill: "Notifications", wide: true },
            ].map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.1} className={`feature-card${f.large ? " feature-card--large" : ""}${f.wide ? " feature-card--wide" : ""}`}>
                <motion.div className="feature-card-inner" whileHover={{ scale: 1.02 }}>
                  <div className="feature-icon-wrap">
                    <span className="feature-icon">{f.icon}</span>
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className="feature-pill">{f.pill}</div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ IKS SECTION ══════════ */}
      <section className="iks-section" id="iks">
        <div className="section-container">
          <div className="iks-grid">
            <FadeUp>
              <div className="section-label">Indian Knowledge Systems</div>
              <h2 className="section-title">Rooted in Ancient Science</h2>
              <p className="iks-description">
                Ayurveda, one of the world's oldest healing systems, teaches that true health comes from living in harmony with nature's rhythms.{" "}
                <strong>Prakriti</strong> is your unique body-mind constitution — a blend of Vata, Pitta, and Kapha doshas — that shapes your physiology, personality, and susceptibilities.{" "}
                <strong>Dinacharya</strong> is the Ayurvedic daily regimen designed to align your body clock with cosmic cycles, promoting vitality, clarity, and longevity.
              </p>
              <button className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={() => navigate("/prakriti")}>
                Discover Your Prakriti →
              </button>
            </FadeUp>
            <div className="iks-cards">
              {[
                { icon: "🌿", title: "Ayurveda", desc: "The science of life — a 5,000-year-old holistic healing system from ancient India" },
                { icon: "🔮", title: "Prakriti",  desc: "Your unique constitutional type — Vata, Pitta, or Kapha — that guides personalised wellness" },
                { icon: "🌅", title: "Dinacharya", desc: "Daily routine aligned with nature's cycles — from Brahma Muhurta to evening wind-down" },
              ].map((c, i) => (
                <FadeUp key={c.title} delay={0.1 + i * 0.12}>
                  <motion.div className="iks-card" whileHover={{ x: 6, boxShadow: "0 8px 32px rgba(74,181,74,0.12)" }}>
                    <div className="iks-card-icon">{c.icon}</div>
                    <div>
                      <h4>{c.title}</h4>
                      <p>{c.desc}</p>
                    </div>
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SOCIAL PROOF ══════════ */}
      <section className="sp-section">
        <div className="section-container">
          <FadeUp className="sp-head">
            <div className="section-label">Community</div>
            <h2 className="section-title">Wellness Transformations</h2>
            <p className="section-subtitle">Real experiences from our users and IIT Roorkee research community</p>
          </FadeUp>

          <div className="sp-cred-bar">
            <FadeUp delay={0.1}>
              <div className="sp-cred">
                <span className="sp-cred-icon">🏛️</span>
                <div>
                  <div className="sp-cred-title">IIT Roorkee</div>
                  <div className="sp-cred-sub">Research Project</div>
                </div>
              </div>
            </FadeUp>
            <div className="sp-cred-sep" />
            <FadeUp delay={0.15}>
              <div className="sp-cred">
                <span className="sp-cred-icon">📋</span>
                <div>
                  <div className="sp-cred-title">1,000+</div>
                  <div className="sp-cred-sub">Assessments</div>
                </div>
              </div>
            </FadeUp>
            <div className="sp-cred-sep" />
            <FadeUp delay={0.2}>
              <div className="sp-cred">
                <span className="sp-cred-icon">⭐</span>
                <div>
                  <div className="sp-cred-title">4.9 / 5.0</div>
                  <div className="sp-cred-sub">Avg. Rating</div>
                </div>
              </div>
            </FadeUp>
            <div className="sp-cred-sep" />
            <FadeUp delay={0.25}>
              <div className="sp-cred">
                <span className="sp-cred-icon">🌿</span>
                <div>
                  <div className="sp-cred-title">94%</div>
                  <div className="sp-cred-sub">Felt Improved</div>
                </div>
              </div>
            </FadeUp>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.14}>
                <motion.div className="testimonial-card" whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(0,0,0,0.09)" }}>
                  <div className="tc-stars">{"⭐".repeat(t.stars)}</div>
                  <p className="tc-text">"{t.text}"</p>
                  <div className="tc-author">
                    <span className="tc-avatar">{t.avatar}</span>
                    <div>
                      <div className="tc-name">{t.name}</div>
                      <div className="tc-role">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="cta-section">
        <div className="cta-blob cta-blob-1" />
        <div className="cta-blob cta-blob-2" />
        <div className="cta-container">
          <FadeUp>
            <motion.div className="cta-icon-wrap"
              animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              🌸
            </motion.div>
            <h2 className="cta-title">Start Your Personalised Wellness Journey Today</h2>
            <p className="cta-subtitle">
              Join thousands who have transformed their daily lives with Ayurvedic wisdom
            </p>
            <button className="btn btn-white btn-cta-large" onClick={() => navigate("/signup")}>
              Start Now — It's Free →
            </button>
          </FadeUp>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="logo-leaf">🌿</span>
            <span className="logo-text">Dincharya</span>
          </div>
          <p className="footer-tagline">Align your lifestyle with ancient wisdom and modern data</p>
          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="/prakriti" onClick={(e) => { e.preventDefault(); navigate("/prakriti"); }}>Prakriti Test</a>
            <a href="/signup"   onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>Sign Up</a>
          </div>
          <p className="footer-copy">© 2025 Dincharya · Built with ❤️ and Ayurveda</p>
        </div>
      </footer>
    </div>
  );
}
