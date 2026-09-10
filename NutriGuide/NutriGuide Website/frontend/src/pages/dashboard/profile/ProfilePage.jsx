import { useEffect, useState, useMemo } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import Header from "../../../components/navigation/Header";
import styles from "./ProfilePage.module.css";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const CONDITIONS = ["Diabetes","Hypertension","Thyroid","PCOS","Cholesterol"];
const ALLERGIES = ["Dairy","Gluten","Nuts","Soy","Eggs","Seafood"];
const DIETS = ["Vegetarian","Non-Vegetarian","Vegan","Eggetarian"];
const GOALS = ["Lose","Gain","Maintain","Muscle","Healthy"];
const ACTIVITY = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light Active" },
  { value: "moderate", label: "Moderate Active" },
  { value: "very", label: "Very Active" }
];

export default function ProfilePage() {
  const navigate = useNavigate();

    const handleLogout = async () => {
      try {
        await signOut(auth);
        navigate("/");
      } catch (error) {
        console.error("Logout Error:", error);
      }
    };
  const [data, setData] = useState(null);
  const [original, setOriginal] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setEmail(user.email || "");

    const snap = await getDoc(doc(db, "users", user.uid));
    const userData = snap.data();

    if (userData) {
      setData(userData);
      setOriginal(JSON.stringify(userData));
    }
  };

  const updateField = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const toggleArray = (section, field, value) => {
    setData(prev => {
      const list = prev?.[section]?.[field] || [];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: list.includes(value)
            ? list.filter(v => v !== value)
            : [...list, value]
        }
      };
    });
  };

  const liveResults = useMemo(() => {
    if (!data?.basicProfile || !data?.preferences) return null;

    const { weight, height, age, gender } = data.basicProfile;
    const activity = data.preferences.activity;

    if (!weight || !height || !age) return null;

    const bmiValue = weight / ((height / 100) ** 2);
    const bmi = bmiValue.toFixed(1);

    let bmiCategory = "Normal";
    if (bmiValue < 18.5) bmiCategory = "Underweight";
    else if (bmiValue >= 25 && bmiValue < 30) bmiCategory = "Overweight";
    else if (bmiValue >= 30) bmiCategory = "Obese";

    let bmr =
      gender === "Male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725
    };

    const tdee = Math.round(bmr * (multipliers[activity] || 1.2));

    return { bmi, bmiCategory, tdee };
  }, [data]);

  const saveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const updatedData = {
        ...data,
        mlResult: liveResults
      };

      await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });

      setOriginal(JSON.stringify(updatedData));
      alert("Profile Updated Successfully!");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  if (!data) return <div className={styles.loader}>Loading...</div>;

  const changed = JSON.stringify(data) !== original;
  const { basicProfile, healthProfile, preferences } = data;

return (
  <div className={styles.wrapper}>
    <Header title="Account Profile" userName={basicProfile?.name} />

    <div className={styles.layout}>

      {/* LEFT PANEL */}
      <div>

        <div className={styles.profileCard}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              <div className={styles.avatarInner}>👤</div>
            </div>
            <div className={styles.avatarBadge}>✨</div>
          </div>

          <h2>{basicProfile?.name}</h2>
          <div className={styles.email}>✉️ {email}</div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>📅 Age</div>
              <div className={styles.statValue}>{basicProfile?.age}</div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statLabel}>⚧ Gender</div>
              <div className={styles.statValueSmall}>{basicProfile?.gender}</div>
            </div>
          </div>

          {liveResults && (
            <div className={styles.bmiBox}>
              <div className={styles.bmiHeader}>
                <div className={styles.bmiTitle}>❤️ Health Metrics</div>
              </div>

              <div className={styles.bmiGrid}>
                <div className={styles.bmiCard}>
                  <p>BMI</p>
                  <p>{liveResults.bmi}</p>
                  <p>{liveResults.bmiCategory}</p>
                </div>

                <div className={styles.bmiCard}>
                  <p>TDEE</p>
                  <p>{liveResults.tdee}</p>
                  <p>kcal/day</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.quickInfo}>
          <div className={styles.quickInfoTitle}>🛡 Health Overview</div>

          <div className={styles.quickInfoItem}>
            <div className={styles.quickInfoLabel}>Diet</div>
            <span className={`${styles.badge} ${styles.badgeEmerald}`}>
              {healthProfile?.diet}
            </span>
          </div>

          <div className={styles.quickInfoItem}>
            <div className={styles.quickInfoLabel}>Activity</div>
            <span className={`${styles.badge} ${styles.badgeCyan}`}>
              {preferences?.activity}
            </span>
          </div>
          
          <div className={styles.aiCard}>
            <div className={styles.aiIcon}>💡</div>

            <div>
              <h4>AI Recommendation</h4>
              <p>
                Update your weight every 2 weeks for more
                accurate daily calorie calculations.
              </p>
            </div>
          </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div className={styles.right}>

        {/* PERSONAL */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconEmerald}`}>👤</div>
            <h3>Personal Information</h3>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name</label>
              <input
                value={basicProfile?.name || ""}
                onChange={e => updateField("basicProfile","name",e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input value={email} disabled />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Age</label>
              <input
                type="number"
                value={basicProfile?.age || ""}
                onChange={e => updateField("basicProfile","age",Number(e.target.value))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Gender</label>
              <select
                value={basicProfile?.gender || ""}
                onChange={e => updateField("basicProfile","gender",e.target.value)}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* PHYSICAL */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconCyan}`}>📏</div>
            <h3>Physical Metrics</h3>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Height (cm)</label>
              <input
                type="number"
                value={basicProfile?.height || ""}
                onChange={e => updateField("basicProfile","height",Number(e.target.value))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Weight (kg)</label>
              <input
                type="number"
                value={basicProfile?.weight || ""}
                onChange={e => updateField("basicProfile","weight",Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* HEALTH */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconRed}`}>❤️</div>
            <h3>Health Profile</h3>
          </div>
          <h4 className={styles.sub}>Diseases</h4>
          <div className={styles.chips}>
            {CONDITIONS.map(c => (
              <button
                key={c}
                className={`${styles.chip} ${
                  healthProfile?.conditions?.includes(c) ? styles.chipActive : ""
                }`}
                onClick={() => toggleArray("healthProfile","conditions",c)}
              >
                {c}
              </button>
            ))}
          </div>

          <h4 className={styles.sub}>Allergies</h4>

          <div className={styles.chips}>
            {ALLERGIES.map(a => (
              <button
                key={a}
                className={`${styles.chip} ${
                  healthProfile?.allergies?.includes(a)
                    ? styles.chipActiveAllergy
                    : ""
                }`}
                onClick={() => toggleArray("healthProfile","allergies",a)}
              >
                {a}
              </button>
            ))}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Diet</label>
            <select
              value={healthProfile?.diet || ""}
              onChange={e => updateField("healthProfile","diet",e.target.value)}
            >
              {DIETS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* GOALS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconPurple}`}>🎯</div>
            <h3>Fitness Goals</h3>
          </div>

          <div className={styles.goalsGrid}>
            {GOALS.map((g) => {
              let goalEmoji = "";

              if (g === "Lose") goalEmoji = "🔥";
              else if (g === "Gain") goalEmoji = "📈";
              else if (g === "Maintain") goalEmoji = "⚖️";
              else if (g === "Muscle") goalEmoji = "💪";
              else if (g === "Healthy") goalEmoji = "🌿";

              return (
                <div
                  key={g}
                  className={`${styles.goalCard} ${
                    data?.goal === g ? styles.goalCardActive : ""
                  }`}
                  onClick={() => setData((prev) => ({ ...prev, goal: g }))}
                >
                  <div className={styles.goalIcon}>{goalEmoji}</div>
                  <div className={styles.goalLabel}>{g}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PREF */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconTeal}`}>⚙️</div>
            <h3>Preferences</h3>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Activity</label>
              <select
                value={preferences?.activity || ""}
                onChange={e => updateField("preferences","activity",e.target.value)}
              >
                {ACTIVITY.map(a => <option key={a.value}>{a.label}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Meals</label>
              <input
                type="number"
                value={preferences?.mealsPerDay || ""}
                onChange={e => updateField("preferences","mealsPerDay",Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <button
          className={`${styles.saveBtn} ${
            changed ? styles.activeSave : styles.disabledSave
          }`}
          disabled={!changed}
          onClick={saveProfile}
        >
          💾 Save Profile Changes
        </button>

      </div>
    </div>
  </div>
);
}