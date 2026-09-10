import { useEffect, useState } from "react";
import {
  doc, getDoc, collection, addDoc,
  query, where, getDocs, serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../../../firebase";
import { generateExercisePlan } from "../../../services/exerciseService";
import Header from "../../../components/navigation/Header";
import styles from "./Exercise.module.css";

const toSentenceCase = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ── Decorative floating SVG blobs (purely visual, no logic) ──────────────────
const FloatingOrbs = () => (
  <div className={styles.orbLayer} aria-hidden="true">
    <svg className={`${styles.orb} ${styles.orb1}`} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g1" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#g1)"/>
    </svg>

    <svg className={`${styles.orb} ${styles.orb2}`} viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g2" cx="60%" cy="35%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="80" fill="url(#g2)"/>
    </svg>

    <svg className={`${styles.orb} ${styles.orb3}`} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g3" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.30"/>
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="60" fill="url(#g3)"/>
    </svg>

    {/* Sparkle dots */}
    <svg className={`${styles.sparkle} ${styles.sparkle1}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" fill="#4ade80" opacity="0.6"/>
    </svg>
    <svg className={`${styles.sparkle} ${styles.sparkle2}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" fill="#14b8a6" opacity="0.5"/>
    </svg>
    <svg className={`${styles.sparkle} ${styles.sparkle3}`} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0 L9 7 L16 8 L9 9 L8 16 L7 9 L0 8 L7 7 Z" fill="#fb923c" opacity="0.55"/>
    </svg>
  </div>
);

// ── Leaf SVG illustration for section headers ────────────────────────────────
const LeafIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 28 C6 28 10 14 24 8 C24 8 22 22 6 28Z" fill="currentColor" opacity="0.9"/>
    <line x1="6" y1="28" x2="18" y2="14" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
  </svg>
);

// ── Progress ring (replaces raw SVG in JSX for cleaner markup) ───────────────
const ProgressRing = ({ percent, calories }) => {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * percent) / 100;

  return (
    <div className={styles.ringContainer}>
      <svg width="170" height="170" viewBox="0 0 170 170">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80"/>
            <stop offset="100%" stopColor="#10b981"/>
          </linearGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle cx="85" cy="85" r={r} className={styles.circleBg}/>
        {/* Glow shadow ring */}
        <circle
          cx="85" cy="85" r={r}
          className={styles.circleGlow}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ filter: "url(#ringGlow)" }}
        />
        {/* Main progress ring */}
        <circle
          cx="85" cy="85" r={r}
          className={styles.circleProgress}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          stroke="url(#ringGrad)"
        />
      </svg>

      <div className={styles.ringLabel}>
        <span className={styles.ringCalNum}>{calories}</span>
        <span className={styles.ringCalUnit}>🔥 kcal</span>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Exercise = () => {
  const [userData, setUserData] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loggedExercises, setLoggedExercises] = useState({});
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [minutesBurned, setMinutesBurned] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();
      setUserData(data);

      await loadLogged(user.uid);
      await generatePlan(data);
    });

    return () => unsub();
  }, []);

  const generatePlan = async (data) => {
    const payload = {
      weight: Number(data.basicProfile.weight),
      age: Number(data.basicProfile.age),
      gender: data.basicProfile.gender.toLowerCase(),
      activity_level: data.preferences.activity.toLowerCase(),
      goal: data.goal,
    };

    const res = await generateExercisePlan(payload);
    setPlan(res);
  };

  const loadLogged = async (uid) => {
    const q = query(
      collection(db, "users", uid, "loggedExercises"),
      where("date", "==", today)
    );

    const snap = await getDocs(q);

    let cal = 0, mins = 0, map = {};

    snap.forEach(d => {
      const x = d.data();
      map[x.name] = true;
      cal += Number(x.calories);
      mins += Number(x.duration);
    });

    setLoggedExercises(map);
    setCaloriesBurned(cal);
    setMinutesBurned(mins);
  };

  const logExercise = async (e) => {
    const uid = auth.currentUser.uid;

    const formattedName = toSentenceCase(e.name);

    await addDoc(collection(db, "users", uid, "loggedExercises"), {
      name: formattedName,
      calories: e.calories,
      duration: e.duration,
      date: today,
      loggedAt: serverTimestamp()
    });

    setLoggedExercises(prev => ({ ...prev, [e.name]: true }));
    setCaloriesBurned(p => p + e.calories);
    setMinutesBurned(p => p + e.duration);
  };

  const refreshAll = () => generatePlan(userData);

  const refreshSection = (section) => {
    const newPlan = { ...plan };
    newPlan[section] = [...plan[section]].sort(() => 0.5 - Math.random());
    setPlan(newPlan);
  };

  const goals = { lose: 500, muscle: 400, gain: 300, maintain: 350 };
  const goalCal = goals[userData?.goal] || 350;

  const percent = Math.min((caloriesBurned / goalCal) * 100, 100);

  if (!userData) return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingPulse}>
        <span>🌿</span>
      </div>
      <p>Loading your plan…</p>
    </div>
  );

  return (
    <>
      <Header userName={userData?.basicProfile?.name} />

      <main className={styles.container}>
        <FloatingOrbs />

        {/* ── Page header ── */}
        <header className={styles.pageHeader}>
          <div className={styles.topBar}>
            <div className={styles.titleBlock}>
              <span className={styles.titleEyebrow}>Daily Routine</span>
              <h1 className={styles.pageTitle}>Today's Exercise Plan</h1>
            </div>

            <button className={styles.refreshAll} onClick={refreshAll} aria-label="Reset progress">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              Reset Progress
            </button>
          </div>

          <p className={styles.subtitle}>
            Complete your personalized workout routine for optimal results
          </p>
        </header>

        {/* ── Main grid ── */}
        <div className={styles.grid}>

          {/* Left column: sections */}
          <div className={styles.sectionsCol}>
            <Section
              title="Warmup"
              emoji="💗"
              color="warmup"
              data={plan?.warmup || []}
              section="warmup"
              refreshSection={refreshSection}
              loggedExercises={loggedExercises}
              logExercise={logExercise}
            />

            <Section
              title="Main Workout"
              emoji="💪"
              color="main"
              data={plan?.main || []}
              section="main"
              refreshSection={refreshSection}
              loggedExercises={loggedExercises}
              logExercise={logExercise}
            />

            <Section
              title="Cooldown"
              emoji="🧘🏻"
              color="cooldown"
              data={plan?.cooldown || []}
              section="cooldown"
              refreshSection={refreshSection}
              loggedExercises={loggedExercises}
              logExercise={logExercise}
            />
          </div>

          {/* Right column: summary card */}
          <aside className={styles.summaryCard}>
            {/* Decorative leaf */}
            <LeafIcon className={styles.summaryLeaf}/>

            <h2 className={styles.summaryTitle}>
              <span className={styles.summaryTitleIcon}>🎯</span>
              Today's Progress
            </h2>

            <ProgressRing percent={percent} calories={caloriesBurned} />

            <ul className={styles.statsList}>
              <li className={styles.statItem}>
                <div className={styles.statIcon} data-color="teal">⏱️</div>
                <div className={styles.statBody}>
                  <span className={styles.statLabel}>Duration</span>
                  <strong className={styles.statValue}>{minutesBurned} mins</strong>
                </div>
              </li>

              <li className={styles.statItem}>
                <div className={styles.statIcon} data-color="orange">🎯</div>
                <div className={styles.statBody}>
                  <span className={styles.statLabel}>Calorie Goal</span>
                  <strong className={styles.statValue}>{goalCal} kcal</strong>
                </div>
              </li>

              <li className={styles.statItem}>
                <div className={styles.statIcon} data-color="green">✅</div>
                <div className={styles.statBody}>
                  <span className={styles.statLabel}>Completed</span>
                  <strong className={styles.statValue}>{Object.keys(loggedExercises).length} exercises</strong>
                </div>
              </li>
            </ul>

            {/* Progress bar */}
            <div className={styles.progressTrack} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <div className={styles.progressFill} style={{ width: `${percent}%` }}/>
              <span className={styles.progressLabel}>{Math.round(percent)}%</span>
            </div>

            {/* Motivational chip */}
            <div className={styles.motivChip}>
              {percent >= 100
                ? "🏆 Goal Crushed!"
                : percent >= 50
                ? "🔥 Keep Going!"
                : "🌱 Just Getting Started"}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
};

// ── Section sub-component ─────────────────────────────────────────────────────
const Section = ({
  title, emoji, data, section,
  refreshSection, loggedExercises, logExercise, color
}) => (
  <section className={`${styles.section} ${styles[`section_${color}`]}`}>
    {/* Header stripe */}
    <div className={styles.sectionHeader}>
      <div className={styles.sectionTitleRow}>
        <span className={styles.sectionEmoji} aria-hidden="true">{emoji}</span>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <span className={styles.sectionCount}>{data.length}</span>
      </div>

      <button
        className={styles.sectionRefresh}
        onClick={() => refreshSection(section)}
        aria-label={`Shuffle ${title}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      </button>
    </div>

    {/* Exercise cards */}
    <div className={styles.cardList}>
      {data.map((e, i) => (
        <article
          key={i}
          className={`${styles.card} ${loggedExercises[toSentenceCase(e.name)] ? styles.cardLogged : ""}`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className={styles.cardInfo}>
            <span className={styles.cardIndex}>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <strong className={styles.cardName}>{toSentenceCase(e.name)}</strong>
              <p className={styles.cardMeta}>
                <span>⏱ {e.duration} mins</span>
                <span className={styles.metaDot}>·</span>
                <span>🔥 {e.calories} kcal</span>
              </p>
            </div>
          </div>

          <button
            className={`${styles.logBtn} ${loggedExercises[e.name] ? styles.logBtnDone : ""}`}
            disabled={loggedExercises[toSentenceCase(e.name)]}
            onClick={() => logExercise(e)}
            aria-label={
                loggedExercises[toSentenceCase(e.name)]
                  ? `${toSentenceCase(e.name)} logged`
                  : `Log ${toSentenceCase(e.name)
                    
                  }`
}
          >
            {loggedExercises[toSentenceCase(e.name)]
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Logged</>
              : "Log"}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default Exercise;