import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import styles from "./GoalsStep.module.css";

const STORAGE_KEY = "dietGoals";

const GOALS = [
  { key: "lose",     title: "Lose Weight",       desc: "Healthy calorie deficit for steady fat loss",  icon: "⚖️",  gradient: "linear-gradient(135deg,#f0fdf4,#dcfce7)" },
  { key: "gain",     title: "Gain Weight",        desc: "Nutritious caloric surplus to build mass",     icon: "💪",  gradient: "linear-gradient(135deg,#fff7ed,#ffedd5)" },
  { key: "maintain", title: "Maintain Weight",    desc: "Balanced nutrition for your ideal weight",     icon: "🎯",  gradient: "linear-gradient(135deg,#eff6ff,#dbeafe)" },
  { key: "muscle",   title: "Build Muscle",       desc: "High protein focus for strength gains",        icon: "🏋️", gradient: "linear-gradient(135deg,#fdf4ff,#fae8ff)" },
  { key: "healthy",  title: "Healthy Lifestyle",  desc: "Overall wellness and balanced living",         icon: "🌿",  gradient: "linear-gradient(135deg,#f0fdf4,#ccfbf1)" },
];

const GoalsStep = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSelectedGoal(JSON.parse(saved).goal);
  }, []);

  const handleContinue = async () => {
    if (!selectedGoal) {
      setError("Please select a goal to continue");
      return;
    }
    const uid = auth.currentUser.uid;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ goal: selectedGoal }));
    await setDoc(doc(db, "users", uid), { goal: selectedGoal }, { merge: true });
    navigate("/steps/fitness");
  };

  return (
    <div className={styles.wrapper}>
      {/* ─── HEADER ─── */}
      <div className={styles.header}>
        <h1>Let's personalize <span>your experience</span></h1>
        <p>This helps us create the perfect meal plan for you</p>
        <div className={styles.progressWrap}>
          <div className={styles.progressLabels}>
            <span className={styles.pActive}>Profile</span>
            <span className={styles.pActive}>Health</span>
            <span className={styles.pActive}>Goals</span>
            <span>Fitness</span>
            <span>Preferences</span>
          </div>
          <div className={styles.progress}>
            <div className={styles.active}></div>
            <div className={styles.active}></div>
            <div className={styles.active}></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>

      {/* ─── STEP LABEL ─── */}
      <div className={styles.stepTitle}>
        <div className={styles.stepBadge}>Step 3 of 5</div>
        <h2>Your Goals</h2>
      </div>

      {/* ─── CARD ─── */}
      <div className={styles.card}>
        <p className={styles.question}>What would you like to achieve with Nutri Guide?</p>

        <div className={styles.goals}>
          {GOALS.map((g) => (
            <div
              key={g.key}
              className={`${styles.goalCard} ${selectedGoal === g.key ? styles.activeGoal : ""}`}
              onClick={() => { setSelectedGoal(g.key); setError(""); }}
            >
              <div className={styles.iconWrap}>{g.icon}</div>
              <div className={styles.goalText}>
                <h3>{g.title}</h3>
                <p>{g.desc}</p>
              </div>
              {selectedGoal === g.key && (
                <span className={styles.check}>✔</span>
              )}
            </div>
          ))}
        </div>

        {error && <span className={styles.error}>⚠ {error}</span>}
      </div>

      {/* ─── ACTIONS ─── */}
      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={() => navigate("/steps/health")}>← Back</button>
        <button className={styles.continue} onClick={handleContinue}>Continue →</button>
      </div>
    </div>
  );
};

export default GoalsStep;