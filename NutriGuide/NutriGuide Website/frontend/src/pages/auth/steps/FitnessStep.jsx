import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import styles from "./FitnessStep.module.css";

const FitnessStep = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fitnessLevel: "",
    workoutLocation: "",
    equipment: "",
    workoutDays: "",
    workoutTime: "",
    activityLevel: "",
    injuries: [],
    preferredExercises: [],
    avoidedExercises: [],
  });

  const [error, setError] = useState("");

  const selectSingle = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError("");
  };

  const toggleMulti = (key, value) => {
    setForm(prev => {
      const list = prev[key];
      if (key === "injuries") {
        if (value === "None") return { ...prev, injuries: ["None"] };
        return {
          ...prev,
          injuries: list.includes(value)
            ? list.filter(i => i !== value)
            : [...list.filter(i => i !== "None"), value],
        };
      }
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter(i => i !== value) : [...list, value],
      };
    });
    setError("");
  };

  const isComplete = () => {
    const { fitnessLevel, workoutLocation, equipment, workoutDays, workoutTime, injuries, preferredExercises, avoidedExercises } = form;
    return fitnessLevel && workoutLocation && equipment && workoutDays && workoutTime && injuries.length > 0 && preferredExercises.length > 0 && avoidedExercises.length > 0;
  };

  const handleContinue = async () => {
    if (!isComplete()) {
      setError("Please answer all questions to continue");
      return;
    }
    const uid = auth.currentUser.uid;
    localStorage.setItem("fitnessProfile", JSON.stringify(form));
    await updateDoc(doc(db, "users", uid), { fitnessProfile: form });
    navigate("/steps/preferences");
  };

  const sections = [
    {
      label: "Fitness Level",
      key: "fitnessLevel",
      type: "single",
      options: ["Beginner", "Intermediate", "Advanced"],
    },
    {
      label: "Workout Location",
      key: "workoutLocation",
      type: "single",
      options: ["Home", "Gym", "Outdoor"],
    },
    {
      label: "Equipment Available",
      key: "equipment",
      type: "single",
      options: ["Bodyweight", "Dumbbells", "Resistance Bands", "Full Gym"],
    },
    {
      label: "Workout Days / Week",
      key: "workoutDays",
      type: "single",
      options: ["2–3 Days", "4–5 Days", "6+ Days"],
    },
    {
      label: "Workout Duration",
      key: "workoutTime",
      type: "single",
      options: ["15–20 min", "30 min", "45–60 min"],
    },
    {
      label: "Injuries (Current / Past)",
      key: "injuries",
      type: "multi",
      options: ["None","Knee","Shoulder","Lower Back","Upper Back","Neck","Ankle","Wrist","Elbow","Hip"],
    },
    {
      label: "Preferred Exercises",
      key: "preferredExercises",
      type: "multi",
      options: ["Yoga", "Cardio", "Strength", "Dance", "Functional"],
    },
    {
      label: "Exercises to Avoid",
      key: "avoidedExercises",
      type: "multi",
      options: ["Running", "Jumping", "Burpees", "Plank", "HIIT"],
    },
  ];

  const isSelected = (section, option) => {
    if (section.type === "single") return form[section.key] === option;
    return form[section.key].includes(option);
  };

  const handleClick = (section, option) => {
    if (section.type === "single") selectSingle(section.key, option);
    else toggleMulti(section.key, option);
  };

  return (
    <div className={styles.wrapper}>
      {/* ─── HEADER ─── */}
      <div className={styles.header}>
        <h1>Personalize your <span>fitness journey</span></h1>
        <p>Answer a few questions to tailor your workouts</p>
        <div className={styles.progressWrap}>
          <div className={styles.progressLabels}>
            <span className={styles.pActive}>Profile</span>
            <span className={styles.pActive}>Health</span>
            <span className={styles.pActive}>Goals</span>
            <span className={styles.pActive}>Fitness</span>
            <span>Preferences</span>
          </div>
          <div className={styles.progress}>
            <div className={styles.active}></div>
            <div className={styles.active}></div>
            <div className={styles.active}></div>
            <div className={styles.active}></div>
            <div></div>
          </div>
        </div>
      </div>

      {/* ─── STEP LABEL ─── */}
      <div className={styles.stepTitle}>
        <div className={styles.stepBadge}>Step 4 of 5 — Fitness</div>
        <h2>Fitness Profile</h2>
      </div>

      {/* ─── CARD ─── */}
      <div className={styles.card}>
        {sections.map((section, idx) => (
          <div key={section.key}>
            <h3>{section.label}</h3>
            <div className={styles.chips}>
              {section.options.map(option => (
                <button
                  key={option}
                  className={isSelected(section, option) ? styles.activeChip : ""}
                  onClick={() => handleClick(section, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        {error && <p className={styles.error}>⚠ {error}</p>}
      </div>

      {/* ─── ACTIONS ─── */}
      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={() => navigate("/steps/goals")}>← Back</button>
        <button className={styles.continueBtn} onClick={handleContinue}>Continue →</button>
      </div>
    </div>
  );
};

export default FitnessStep;