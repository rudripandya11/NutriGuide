import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";

import styles from "./BasicProfileStep.module.css";

const STORAGE_KEY = "basicProfile";

/* ── Inline SVG icons ── */
const LeafSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 70 Q40 10 70 10 Q70 40 40 70 Z" fill="#22c55e"/>
    <path d="M40 70 Q40 40 70 10" stroke="#16a34a" strokeWidth="2"/>
  </svg>
);

const HeartSVG = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 80 L15 45 C5 35 5 20 20 15 C30 11 40 18 50 28 C60 18 70 11 80 15 C95 20 95 35 85 45 Z" fill="#22c55e"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const RulerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/>
    <path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/>
  </svg>
);

const WeightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 18h12"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-4"/>
    <path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2c0-1.1.9-2 2-2h6a2 2 0 0 1 2 2"/>
  </svg>
);

const NutriLogo = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 28 L6 18 C1 13 1 6 8 4 C11 3 14 5 16 8 C18 5 21 3 24 4 C31 6 31 13 26 18 Z" fill="url(#lg1)"/>
    <path d="M16 8 L16 28" stroke="white" strokeWidth="1.5" strokeOpacity="0.5"/>
    <circle cx="10" cy="20" r="3" fill="white" fillOpacity="0.3"/>
    <defs>
      <linearGradient id="lg1" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22c55e"/>
        <stop offset="1" stopColor="#0d9488"/>
      </linearGradient>
    </defs>
  </svg>
);

const genderData = [
  { value: "Female", icon: "♀", emoji: "👩" },
  { value: "Male",   icon: "♂", emoji: "👨" },
  { value: "Other",  icon: "⚧", emoji: "🧑" },
];

const BasicProfileStep = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Female",
    height: "",
    weight: "",
  });

  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setForm(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.age || form.age < 5 || form.age > 100) newErrors.age = "Enter a valid age (5–100)";
    if (!form.height || form.height < 50 || form.height > 250) newErrors.height = "Enter valid height in cm";
    if (!form.weight || form.weight < 20 || form.weight > 300) newErrors.weight = "Enter valid weight in kg";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const basicProfileData = {
      ...form,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(basicProfileData));
    localStorage.setItem("gender", form.gender);
    try {
      const uid = auth.currentUser.uid;
      await updateDoc(doc(db, "users", uid), { basicProfile: basicProfileData });
      navigate("/steps/health");
    } catch (error) {
      console.error("Error saving basic profile:", error);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Floating decorative SVGs */}
      <div className={styles.leaf1}><LeafSVG /></div>
      <div className={styles.leaf2}><HeartSVG /></div>
      <div className={styles.leaf3}><LeafSVG /></div>

      {/* ─── HEADER ─── */}
      <div className={styles.header}>
        <div className={styles.logoMark}>
          <NutriLogo />
          <span>Nutri Guide</span>
        </div>
        <h1>
          Let's personalize<br />
          <span>your experience</span>
        </h1>
        <p>Tell us about yourself to craft your perfect meal plan</p>

        <div className={styles.progressWrap}>
          <div className={styles.progressLabels}>
            <span className={styles.pActive}>Profile</span>
            <span>Health</span>
            <span>Goals</span>
            <span>Fitness</span>
            <span>Preferences</span>
          </div>
          <div className={styles.progress}>
            <div className={styles.active}></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>

      {/* ─── STEP LABEL ─── */}
      <div className={styles.stepTitle}>
        <div className={styles.stepBadge}>Step 1 of 5</div>
        <h2>Basic Profile</h2>
      </div>

      {/* ─── CARD ─── */}
      <div className={styles.card}>
        {/* Decorative background shape */}
        <div className={styles.cardDecor}>
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#22c55e"/>
            <circle cx="60" cy="70" r="40" fill="#16a34a"/>
            <circle cx="140" cy="130" r="50" fill="#0d9488"/>
          </svg>
        </div>

        {/* Name */}
        <p className={styles.sectionLabel}>Personal Info</p>
        <div className={styles.field}>
          <label><UserIcon /> Your Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Priya Sharma"
          />
          {errors.name && <span>⚠ {errors.name}</span>}
        </div>

        <div className={styles.divider} />

        {/* Age + Gender */}
        <p className={styles.sectionLabel}>Age & Gender</p>
        <div className={styles.row}>
          <div className={styles.field}>
            <label><CalendarIcon /> Age</label>
            <input
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              placeholder="e.g. 25"
            />
            {errors.age && <span>⚠ {errors.age}</span>}
          </div>

          <div className={styles.field}>
            <label>Gender</label>
            <div className={styles.gender}>
              {genderData.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  className={form.gender === g.value ? styles.activeGender : ""}
                  onClick={() => setForm({ ...form, gender: g.value })}
                >
                  <span className={styles.genderIcon}>{g.emoji}</span>
                  {g.value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Height + Weight */}
        <p className={styles.sectionLabel}>Body Metrics</p>
        <div className={styles.row}>
          <div className={styles.field}>
            <label><RulerIcon /> Height (cm)</label>
            <input
              name="height"
              type="number"
              value={form.height}
              onChange={handleChange}
              placeholder="e.g. 165"
            />
            {errors.height && <span>⚠ {errors.height}</span>}
          </div>

          <div className={styles.field}>
            <label><WeightIcon /> Weight (kg)</label>
            <input
              name="weight"
              type="number"
              value={form.weight}
              onChange={handleChange}
              placeholder="e.g. 60"
            />
            {errors.weight && <span>⚠ {errors.weight}</span>}
          </div>
        </div>
      </div>

      <button className={styles.continueBtn} onClick={handleSubmit}>
        Continue →
      </button>
    </div>
  );
};

export default BasicProfileStep;