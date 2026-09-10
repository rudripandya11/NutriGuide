import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import styles from "./PreferencesStep.module.css";

const BUDGETS = [
  { key: "budget",   label: "Low (<=3000)",   icon: "💰", sub: "Save while eating well" },
  { key: "moderate", label: "Moderate (<=8000)", icon: "💳", sub: "Best value balance"       },
  { key: "premium",  label: "Premium (>=10000)",  icon: "💎", sub: "Top quality ingredients"  },
];

const ACTIVITIES = [
  { key: "sedentary", title: "Sedentary",         desc: "Little to no exercise"              },
  { key: "light",     title: "Lightly Active",    desc: "Light exercise 1–3 days/week"       },
  { key: "moderate",  title: "Moderately Active", desc: "Moderate exercise 3–5 days/week"    },
  { key: "very",      title: "Very Active",       desc: "Hard exercise 6–7 days/week"        },
];

const MEALS = [3, 4, 5, 6];

const PreferencesStep = () => {
  const navigate = useNavigate();

  const [budget,   setBudget]   = useState("");
  const [activity, setActivity] = useState("");
  const [meals,    setMeals]    = useState(null);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const validate = () => {
    const err = {};
    if (!budget)   err.budget   = "Select budget";
    if (!activity) err.activity = "Select activity level";
    if (!meals)    err.meals    = "Select meals per day";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const calculateBMI = (weight, heightCm) => {
    const h = heightCm / 100;
    const bmi = weight / (h * h);
    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";
    return { bmi: bmi.toFixed(1), category };
  };

  const calculateTDEE = (weight, heightCm, age, gender, activityLevel) => {
    let bmr;
    if (gender === "Male") bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5;
    else                   bmr = 10 * weight + 6.25 * heightCm - 5 * age - 161;
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725 };
    return Math.round(bmr * (multipliers[activityLevel] || 1.2));
  };

  const handleComplete = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const uid = auth.currentUser.uid;
      const basicProfile   = JSON.parse(localStorage.getItem("basicProfile"));
      const healthProfile  = JSON.parse(localStorage.getItem("healthProfile"));
      const dietGoals      = JSON.parse(localStorage.getItem("dietGoals"));
      const fitnessProfile = JSON.parse(localStorage.getItem("fitnessProfile"));

      if (!basicProfile || !healthProfile || !dietGoals || !fitnessProfile) {
        alert("Incomplete onboarding. Please complete all steps.");
        setLoading(false);
        return;
      }

      const { bmi, category } = calculateBMI(basicProfile.weight, basicProfile.height);
      const tdee = calculateTDEE(basicProfile.weight, basicProfile.height, basicProfile.age, basicProfile.gender, activity);

      await updateDoc(doc(db, "users", uid), {
        preferences: { budget, activity, mealsPerDay: meals },
        mlResult: { bmi, category, tdee },
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      });

      localStorage.removeItem("basicProfile");
      localStorage.removeItem("healthProfile");
      localStorage.removeItem("dietGoals");
      localStorage.removeItem("fitnessProfile");
      localStorage.removeItem("gender");

      navigate("/dashboard");
    } catch (err) {
      console.error("Final submit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* ─── HEADER ─── */}
      <div className={styles.header}>
        <h1>Almost there — <span>final touches</span></h1>
        <p>Set your preferences and we'll build your perfect plan</p>
        <div className={styles.progressWrap}>
          <div className={styles.progressLabels}>
            <span className={styles.pActive}>Profile</span>
            <span className={styles.pActive}>Health</span>
            <span className={styles.pActive}>Goals</span>
            <span className={styles.pActive}>Fitness</span>
            <span className={styles.pActive}>Preferences</span>
          </div>
          <div className={styles.progress}>
            <div className={styles.active}></div>
            <div className={styles.active}></div>
            <div className={styles.active}></div>
            <div className={styles.active}></div>
            <div className={styles.active}></div>
          </div>
        </div>
      </div>

      {/* ─── STEP LABEL ─── */}
      <div className={styles.stepTitle}>
        <div className={styles.stepBadge}>Step 5 of 5 — Final Step</div>
        <h2>Preferences</h2>
      </div>

      {/* ─── CARD ─── */}
      <div className={styles.card}>

        {/* BUDGET */}
        <h3>Monthly Food Budget</h3>
        <div className={styles.budgetGrid}>
          {BUDGETS.map(b => (
            <button
              key={b.key}
              type="button"
              className={`${styles.budgetCard} ${budget === b.key ? styles.activeCard : ""}`}
              onClick={() => setBudget(b.key)}
            >
              <div className={styles.icon}>{b.icon}</div>
              <span style={{ fontWeight: 700 }}>{b.label}</span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>{b.sub}</span>
            </button>
          ))}
        </div>
        {errors.budget && <span className={styles.error}>⚠ {errors.budget}</span>}

        {/* ACTIVITY */}
        <h3>Activity Level</h3>
        <div className={styles.activityList}>
          {ACTIVITIES.map(a => (
            <div
              key={a.key}
              className={`${styles.activityCard} ${activity === a.key ? styles.activeActivity : ""}`}
              onClick={() => setActivity(a.key)}
            >
              <div>
                <strong>{a.title}</strong>
                <p>{a.desc}</p>
              </div>
              {activity === a.key && <span className={styles.check}>✔</span>}
            </div>
          ))}
        </div>
        {errors.activity && <span className={styles.error}>⚠ {errors.activity}</span>}

        {/* MEALS */}
        <h3>Meals per Day</h3>
        <div className={styles.meals}>
          {MEALS.map(m => (
            <button
              key={m}
              type="button"
              className={`${styles.mealBtn} ${meals === m ? styles.activeMeal : ""}`}
              onClick={() => setMeals(m)}
            >
              {m}
            </button>
          ))}
        </div>
        {errors.meals && <span className={styles.error}>⚠ {errors.meals}</span>}

        {/* COMPLETE BANNER */}
        {budget && activity && meals && (
          <div className={styles.completeBanner}>
            <div className={styles.bannerIcon}>✨</div>
            <div>
              <strong>You're all set!</strong>
              <p>We'll calculate your personalized BMI & daily calorie needs when you complete setup.</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── ACTIONS ─── */}
      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={() => navigate("/steps/fitness")}>← Back</button>
        <button className={styles.completeBtn} onClick={handleComplete} disabled={loading}>
          {loading ? "Setting up your plan..." : "Complete Setup →"}
        </button>
      </div>
    </div>
  );
};

export default PreferencesStep;