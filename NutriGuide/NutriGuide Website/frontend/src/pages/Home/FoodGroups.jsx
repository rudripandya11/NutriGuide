import styles from "./FoodGroups.module.css";
import {
  FaRunning,
  FaDumbbell,
  FaLeaf,
  FaChild,
  FaBalanceScale,
  FaBolt
} from "react-icons/fa";

const exerciseGroups = [
  {
    icon: "🏃🏻",
    name: "Cardio Exercises",
    description: "Activities that increase heart rate and improve endurance.",
    benefits: [
      "Improves heart health",
      "Burns calories",
      "Boosts stamina",
      "Reduces stress",
      "Supports weight loss",
    ],
  },
  {
    icon: "🏋🏻",
    name: "Strength Training",
    description: "Exercises that build muscle strength using resistance.",
    benefits: [
      "Builds muscle mass",
      "Increases metabolism",
      "Strengthens bones",
      "Improves posture",
      "Enhances functional fitness",
    ],
  },
  {
    icon: "🧘🏻",
    name: "Yoga",
    description: "Mind-body exercises focusing on flexibility, breathing, and relaxation.",
    benefits: [
      "Improves flexibility",
      "Reduces stress",
      "Enhances balance",
      "Boosts mental clarity",
      "Improves posture",
    ],
  },
  {
    icon: "🤸🏻",
    name: "Flexibility Exercises",
    description: "Stretching activities that improve mobility and prevent injuries.",
    benefits: [
      "Increases range of motion",
      "Reduces muscle stiffness",
      "Prevents injuries",
      "Improves posture",
      "Enhances recovery",
    ],
  },
  {
    icon: "⚖️",
    name: "Balance & Stability",
    description: "Exercises that improve coordination and body control.",
    benefits: [
      "Improves coordination",
      "Prevents falls",
      "Strengthens core",
      "Enhances body control",
      "Supports joint health",
    ],
  },
  {
    icon: "🔥",
    name: "HIIT Training",
    description: "Short bursts of intense exercise followed by rest periods.",
    benefits: [
      "Burns fat quickly",
      "Boosts metabolism",
      "Saves time",
      "Improves endurance",
      "Enhances cardiovascular fitness",
    ],
  },
];

const plateData = [
  { pct: "40%", label: "Cardio", color: "#22c55e", r: 40 },
  { pct: "30%", label: "Strength", color: "#0d9488", r: 35 },
  { pct: "20%", label: "Flexibility / Yoga", color: "#f97316", r: 30 },
  { pct: "10%", label: "Balance / HIIT", color: "#fbbf24", r: 25 },
];

const FoodGroups = () => {
  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero}>

        {/* Orb 1 */}
        <svg className={styles.heroOrb1} viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="orb1g" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e"/>
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="250" cy="250" r="250" fill="url(#orb1g)"/>
        </svg>

        {/* Orb 2 */}
        <svg className={styles.heroOrb2} viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="orb2g" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316"/>
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="250" cy="250" r="250" fill="url(#orb2g)"/>
        </svg>

        {/* Floating fitness icons SVG */}
        <svg className={styles.heroSvg} xmlns="http://www.w3.org/2000/svg">
          {/* heartbeat line */}
          <polyline
            points="0,80 80,80 100,40 120,120 140,60 160,80 1440,80"
            fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.2"
          >
            <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="8s" repeatCount="indefinite"/>
          </polyline>

          {/* floating dots left */}
          <circle cx="60" cy="200" r="6" fill="#22c55e" opacity="0.25">
            <animate attributeName="cy" values="200;175;200" dur="4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="40" cy="350" r="4" fill="#0d9488" opacity="0.2">
            <animate attributeName="cy" values="350;370;350" dur="5s" repeatCount="indefinite"/>
          </circle>

          {/* floating dots right */}
          <circle cx="1380" cy="180" r="5" fill="#f97316" opacity="0.25">
            <animate attributeName="cy" values="180;160;180" dur="6s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1360" cy="320" r="7" fill="#fbbf24" opacity="0.2">
            <animate attributeName="cy" values="320;340;320" dur="7s" repeatCount="indefinite"/>
          </circle>

          {/* sparkle star top-right */}
          <path d="M1100,50 L1103,62 L1115,65 L1103,68 L1100,80 L1097,68 L1085,65 L1097,62 Z" fill="#22c55e" opacity="0.4">
            <animateTransform attributeName="transform" type="rotate" from="0 1100 65" to="360 1100 65" dur="12s" repeatCount="indefinite"/>
          </path>

          {/* sparkle star bottom-left */}
          <path d="M200,400 L202,410 L212,412 L202,414 L200,424 L198,414 L188,412 L198,410 Z" fill="#fbbf24" opacity="0.35">
            <animateTransform attributeName="transform" type="rotate" from="0 200 412" to="360 200 412" dur="9s" repeatCount="indefinite"/>
          </path>
        </svg>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
            Move & Thrive
          </div>
          <h1>Exercise <em>Categories</em></h1>
          <p>Understanding different exercise types helps you build a balanced, effective fitness routine.</p>
        </div>

        <svg className={styles.heroWave} viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,35 C360,70 720,0 1080,35 C1260,52 1380,30 1440,35 L1440,70 L0,70 Z" fill="#f0fdf4"/>
        </svg>
      </section>

      {/* CARDS */}
      <section className={styles.section}>
        <div className={styles.grid}>
          {exerciseGroups.map((group, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconWrap}>{group.icon}</div>
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <div className={styles.benefitsLabel}>Benefits</div>
              <ul>
                {group.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ROUTINE GUIDE */}
      <section className={styles.plateSection}>

        {/* Background pattern */}
        <svg className={styles.plateSectionBg} viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,300 Q200,100 500,300 Q800,500 1100,300 Q1300,150 1400,300" stroke="#16a34a" strokeWidth="120" fill="none" strokeLinecap="round"/>
        </svg>

        <h2>Build a Balanced Workout Routine</h2>
        <p>A well-rounded plan combines all exercise types for optimal results.</p>

        <div className={styles.plateGrid}>
          {plateData.map((item, index) => (
            <div key={index} className={styles.plateCard}>
              {/* Animated ring */}
              <svg className={styles.plateRing} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${264 * parseInt(item.pct) / 100} 264`}
                  strokeDashoffset="66"
                  transform="rotate(-90 50 50)"
                >
                  <animate attributeName="stroke-dasharray"
                    from={`0 264`}
                    to={`${264 * parseInt(item.pct) / 100} 264`}
                    dur="1.5s" fill="freeze"
                    calcMode="spline"
                    keySplines="0.34 1.56 0.64 1"
                  />
                </circle>
                <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="800" fill={item.color} fontFamily="Nunito, sans-serif">{item.pct}</text>
              </svg>
              <span>{item.pct}</span>
              <p>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default FoodGroups;