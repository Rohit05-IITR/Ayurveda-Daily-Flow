import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="dincharya-app">
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-leaf">🌿</span>
            <span className="logo-text">Dincharya</span>
          </div>
          <ul className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
            <li><a href="#home" onClick={() => setMenuOpen(false)}>Home</a></li>
            <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
            <li>
              <a
                href="/signup"
                className="nav-cta"
                onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate("/signup"); }}
              >
                Get Started
              </a>
            </li>
          </ul>
          <button
            className="hamburger"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-bg-circle circle-1"></div>
        <div className="hero-bg-circle circle-2"></div>
        <div className="hero-content">
          <div className="hero-badge">🌅 Ancient Wisdom · Modern Science</div>
          <h1 className="hero-title">
            Live in Harmony with<br />
            <span className="hero-highlight">Natural Rhythms</span>
          </h1>
          <p className="hero-tagline">
            Align your lifestyle with ancient wisdom and modern data
          </p>
          <div className="hero-buttons">
            <a href="/signup" className="btn btn-primary" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>
              Get Started →
            </a>
            <a href="/prakriti" className="btn btn-outline" onClick={(e) => { e.preventDefault(); navigate("/prakriti"); }}>
              🔬 Take Prakriti Test
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Years of Wisdom</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">3</span>
              <span className="stat-label">Doshas Balanced</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">Wellness Potential</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="mandala-ring ring-outer">
            <div className="mandala-ring ring-middle">
              <div className="mandala-ring ring-inner">
                <div className="mandala-center">
                  <span>☀️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-container">
          <div className="section-label">Simple Process</div>
          <h2 className="section-title">How Dincharya Works</h2>
          <p className="section-subtitle">
            Three simple steps to align your daily routine with Ayurvedic principles
          </p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">🧬</div>
              <h3>Know Yourself</h3>
              <p>Discover your unique Prakriti (body constitution) and Guna (mental tendencies) through our guided assessment</p>
              <div className="step-tags">
                <span className="tag">Prakriti</span>
                <span className="tag">Guna</span>
              </div>
            </div>
            <div className="step-connector">→</div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">📋</div>
              <h3>Get Personalized Plan</h3>
              <p>Receive a tailored Dinacharya (daily routine) with diet recommendations, habits, and lifestyle practices suited to you</p>
              <div className="step-tags">
                <span className="tag">Diet</span>
                <span className="tag">Dinacharya</span>
              </div>
            </div>
            <div className="step-connector">→</div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">📊</div>
              <h3>Track &amp; Improve</h3>
              <p>Monitor your daily habits, view wellness insights on your personal dashboard, and grow week by week</p>
              <div className="step-tags">
                <span className="tag">Dashboard</span>
                <span className="tag">Insights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features" id="features">
        <div className="section-container">
          <div className="section-label">What We Offer</div>
          <h2 className="section-title">Features Built for You</h2>
          <p className="section-subtitle">
            Everything you need to begin and sustain your Ayurvedic wellness journey
          </p>
          <div className="features-grid">
            <div className="feature-card feature-card--large">
              <div className="feature-icon">🌿</div>
              <h3>Dinacharya Score</h3>
              <p>Track how well you follow your daily Ayurvedic routine. Get a wellness score that reflects your consistency and balance throughout the day.</p>
              <div className="feature-pill">Daily Score</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🥗</div>
              <h3>Personalized Diet</h3>
              <p>Food recommendations based on your Prakriti, season, and current imbalances.</p>
              <div className="feature-pill">Nutrition</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔥</div>
              <h3>Habit Streaks</h3>
              <p>Build lasting habits with streaks, milestones, and gentle daily reminders.</p>
              <div className="feature-pill">Consistency</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Weekly Insights</h3>
              <p>Deep-dive reports on your energy, mood, digestion, and overall wellness trends.</p>
              <div className="feature-pill">Analytics</div>
            </div>
            <div className="feature-card feature-card--wide">
              <div className="feature-icon">🔔</div>
              <h3>Smart Reminders</h3>
              <p>Get timely, Ayurveda-aware nudges — morning rituals, meal timing, Abhyanga, meditation, and more. Synced with sunrise and sunset cycles.</p>
              <div className="feature-pill">Notifications</div>
            </div>
          </div>
        </div>
      </section>

      {/* IKS SECTION */}
      <section className="iks-section" id="iks">
        <div className="section-container">
          <div className="iks-grid">
            <div className="iks-text">
              <div className="section-label">Indian Knowledge Systems</div>
              <h2 className="section-title">Rooted in Ancient Science</h2>
              <p className="iks-description">
                Ayurveda, one of the world's oldest healing systems, teaches that true health comes from living in harmony with nature's rhythms. <strong>Prakriti</strong> is your unique body-mind constitution — a blend of Vata, Pitta, and Kapha doshas — that shapes your physiology, personality, and susceptibilities. <strong>Dinacharya</strong> is the Ayurvedic daily regimen designed to align your body clock with cosmic cycles, promoting vitality, clarity, and longevity.
              </p>
              <a href="/prakriti" className="btn btn-primary" style={{ display: "inline-block", marginTop: "1.5rem" }} onClick={(e) => { e.preventDefault(); navigate("/prakriti"); }}>
                Discover Your Prakriti →
              </a>
            </div>
            <div className="iks-cards">
              <div className="iks-card">
                <div className="iks-card-icon">🌿</div>
                <h4>Ayurveda</h4>
                <p>The science of life — a 5,000-year-old holistic healing system from ancient India</p>
              </div>
              <div className="iks-card">
                <div className="iks-card-icon">🔮</div>
                <h4>Prakriti</h4>
                <p>Your unique constitutional type — Vata, Pitta, or Kapha — that guides personalized wellness</p>
              </div>
              <div className="iks-card">
                <div className="iks-card-icon">🌅</div>
                <h4>Dinacharya</h4>
                <p>Daily routine aligned with nature's cycles — from Brahma Muhurta to evening wind-down</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-bg-ornament">🌸</div>
          <h2 className="cta-title">Start Your Personalized Wellness Journey Today</h2>
          <p className="cta-subtitle">
            Join thousands who have transformed their daily lives with Ayurvedic wisdom
          </p>
          <a href="/signup" className="btn btn-white" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>
            Start Now — It's Free →
          </a>
        </div>
      </section>

      {/* FOOTER */}
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
            <a href="/signup" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>Sign Up</a>
          </div>
          <p className="footer-copy">© 2025 Dincharya · Built with ❤️ and Ayurveda</p>
        </div>
      </footer>
    </div>
  );
}
