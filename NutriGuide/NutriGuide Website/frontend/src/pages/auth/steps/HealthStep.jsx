import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import styles from "./HealthStep.module.css";

const STORAGE_KEY = "healthProfile";

const CONDITIONS = ["Diabetes","Hypertension","Thyroid","PCOS","Heart Disease","Cholesterol","Anemia","Arthritis"];
const ALLERGIES  = ["Dairy","Gluten","Nuts","Soy","Eggs","Seafood"];
const SYMPTOMS   = ["Mood Swings","Bloating","Headaches","Fatigue","Irregular Cycles"];

const DIET_OPTIONS = [
  { label: "Vegetarian",     icon: "🥗" },
  { label: "Non-Vegetarian", icon: "🍗" },
  { label: "Vegan",          icon: "🌱" },
  { label: "Eggetarian",     icon: "🥚" },
];

const HealthStep = () => {
  const navigate = useNavigate();
  const gender = localStorage.getItem("gender");

  const [conditions, setConditions] = useState([]);
  const [allergies,  setAllergies]  = useState([]);
  const [diet,       setDiet]       = useState("");
  const [errors,     setErrors]     = useState({});

  const [period, setPeriod] = useState({
    cycleLength: "",
    periodLength: "",
    flow: "",
    cramps: "",
    symptoms: [],
    lastPeriodDate: "",
    cycleRegularity: "",
    painLevel: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setConditions(data.conditions || []);
      setAllergies(data.allergies   || []);
      setDiet(data.diet             || "");
      setPeriod(data.period || {
        cycleLength: "", periodLength: "", flow: "", cramps: "", symptoms: [],
        lastPeriodDate: "", cycleRegularity: "", painLevel: "",
      });
    }
  }, []);

  const toggleItem = (value, list, setter) => {
    setter(list.includes(value) ? list.filter(i => i !== value) : [...list, value]);
  };

  const validate = () => {
    const err = {};
    if (!diet) err.diet = "Please select a dietary preference";
    if (gender === "Female") {
      if (!period.cycleLength)    err.cycle           = "Cycle length required";
      if (!period.periodLength)   err.period          = "Period length required";
      if (!period.flow)           err.flow            = "Flow is required";
      if (!period.lastPeriodDate) err.lastPeriodDate  = "Last period date required";
      if (!period.cycleRegularity)err.cycleRegularity = "Select cycle regularity";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    const healthProfileData = {
      conditions,
      allergies,
      diet,
      period: gender === "Female"
        ? { ...period, cycleLength: Number(period.cycleLength), periodLength: Number(period.periodLength), painLevel: Number(period.painLevel), lastPeriodDate: new Date(period.lastPeriodDate) }
        : null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(healthProfileData));
    try {
      const uid = auth.currentUser.uid;
      await updateDoc(doc(db, "users", uid), { healthProfile: healthProfileData });
      navigate("/steps/goals");
    } catch (error) {
      console.error("Error saving health profile:", error);
    }
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
            <span>Goals</span>
            <span>Fitness</span>
            <span>Preferences</span>
          </div>
          <div className={styles.progress}>
            <div className={styles.active}></div>
            <div className={styles.active}></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>

      {/* ─── STEP LABEL ─── */}
      <div className={styles.stepTitle}>
        <div className={styles.stepBadge}>Step 2 of 5</div>
        <h2>Health Details</h2>
      </div>

      {/* ─── CARD ─── */}
      <div className={styles.card}>

        {/* CONDITIONS */}
        <h3>Health Conditions</h3>
        <div className={styles.chips}>
          {CONDITIONS.map(c => (
            <button
              key={c}
              type="button"
              className={conditions.includes(c) ? styles.activeChip : ""}
              onClick={() => toggleItem(c, conditions, setConditions)}
            >{c}</button>
          ))}
          <button
            type="button"
            className={conditions.length === 0 ? styles.activeChip : ""}
            onClick={() => setConditions([])}
          >✓ None</button>
        </div>

        {/* ALLERGIES */}
        <h3>Food Allergies</h3>
        <div className={styles.chips}>
          {ALLERGIES.map(a => (
            <button
              key={a}
              type="button"
              className={allergies.includes(a) ? styles.activeChip : ""}
              onClick={() => toggleItem(a, allergies, setAllergies)}
            >{a}</button>
          ))}
          <button
            type="button"
            className={allergies.length === 0 ? styles.activeChip : ""}
            onClick={() => setAllergies([])}
          >✓ None</button>
        </div>

        {/* DIET */}
        <h3>Dietary Preference</h3>
        <div className={styles.dietGrid}>
          {DIET_OPTIONS.map(d => (
            <button
              key={d.label}
              type="button"
              className={`${styles.dietCard} ${diet === d.label ? styles.dietActive : ""}`}
              onClick={() => setDiet(d.label)}
            >
              <span>{d.icon}</span>
              {d.label}
            </button>
          ))}
        </div>
        {errors.diet && <span className={styles.error}>⚠ {errors.diet}</span>}

        {/* PERIOD — FEMALE ONLY */}
        {gender === "Female" && (
          <div className={styles.periodBox}>
            <p className={styles.periodTitle}>❤️ Period Tracking</p>

            <div className={styles.row}>
              <input
                type="number"
                placeholder="Cycle Length (days)"
                value={period.cycleLength}
                onChange={e => setPeriod({ ...period, cycleLength: e.target.value })}
              />
              <input
                type="number"
                placeholder="Period Length (days)"
                value={period.periodLength}
                onChange={e => setPeriod({ ...period, periodLength: e.target.value })}
              />
            </div>
            {(errors.cycle || errors.period) && (
              <span className={styles.error}>⚠ {errors.cycle || errors.period}</span>
            )}

            <p>Last Period Start Date</p>
            <input
              type="date"
              value={period.lastPeriodDate}
              onChange={e => setPeriod({ ...period, lastPeriodDate: e.target.value })}
            />
            {errors.lastPeriodDate && <span className={styles.error}>⚠ {errors.lastPeriodDate}</span>}

            <p>Cycle Regularity</p>
            <div className={styles.chips}>
              {["Regular","Irregular"].map(r => (
                <button key={r} type="button"
                  className={period.cycleRegularity === r ? styles.pinkActive : ""}
                  onClick={() => setPeriod({ ...period, cycleRegularity: r })}
                >{r}</button>
              ))}
            </div>
            {errors.cycleRegularity && <span className={styles.error}>⚠ {errors.cycleRegularity}</span>}

            <p>Pain Level (1–5)</p>
            <div className={styles.chips}>
              {[1,2,3,4,5].map(level => (
                <button key={level} type="button"
                  className={period.painLevel === level ? styles.pinkActive : ""}
                  onClick={() => setPeriod({ ...period, painLevel: level })}
                >{level}</button>
              ))}
            </div>

            <p>Flow Intensity</p>
            <div className={styles.chips}>
              {["Light","Medium","Heavy"].map(f => (
                <button key={f} type="button"
                  className={period.flow === f ? styles.pinkActive : ""}
                  onClick={() => setPeriod({ ...period, flow: f })}
                >{f}</button>
              ))}
            </div>
            {errors.flow && <span className={styles.error}>⚠ {errors.flow}</span>}

            <p>Cramps</p>
            <div className={styles.chips}>
              {["None","Mild","Moderate","Severe"].map(c => (
                <button key={c} type="button"
                  className={period.cramps === c ? styles.pinkActive : ""}
                  onClick={() => setPeriod({ ...period, cramps: c })}
                >{c}</button>
              ))}
            </div>

            <p>Common Symptoms</p>
            <div className={styles.chips}>
              {SYMPTOMS.map(s => (
                <button key={s} type="button"
                  className={period.symptoms.includes(s) ? styles.pinkActive : ""}
                  onClick={() => toggleItem(s, period.symptoms, list => setPeriod({ ...period, symptoms: list }))}
                >{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── ACTIONS ─── */}
      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={() => navigate("/steps/basic-profile")}>← Back</button>
        <button className={styles.continueBtn} onClick={handleContinue}>Continue →</button>
      </div>
    </div>
  );
};

export default HealthStep;