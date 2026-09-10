import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth"; // ✅ ADD THIS
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

import {
  getCravingResult,
  logFood,
  logExercise
} from "../../../services/cravingService";

import Header from "../../../components/navigation/Header";
import styles from "./Mood.module.css";


export default function Mood() {

  const auth = getAuth(); // ✅ INIT AUTH
  const [userName, setUserName] = useState("");
  const [userData, setUserData] = useState(null);
 
  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      setUserName(
        user.displayName || user.email?.charAt(0) || "U"
      );
    }
  }, []);

  const [formData, setFormData] = useState({
    mood: "",
    craving: "",
    hunger_level: 5,
    did_eat: false
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [loggedItems, setLoggedItems] = useState({});


  // =========================
  // INPUT HANDLER
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    const pct = ((val - 1) / 9) * 100;
    e.target.style.setProperty('--slider-pct', `${pct}%`);
    setFormData({ ...formData, hunger_level: val });
  };


  // =========================
  // GET USER ID (🔥 CORE FIX)
  // =========================
  const getUserId = () => {
    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return null;
    }

    return user.uid;
  };


  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    const userId = getUserId();
    if (!userId) return;

    setLoading(true);
    setResult(null);
    setLoggedItems({});

    try {
      const data = await getCravingResult({
        user_id: userId, // ✅ FIXED
        ...formData
      });

      setResult(data);
    } catch (error) {
      alert("Error fetching data");
    }

    setLoading(false);
  };


  // =========================
  // REFRESH
  // =========================
  const handleRefresh = async () => {
    const userId = getUserId();
    if (!userId || !result) return;

    try {
      const newData = await getCravingResult({
        user_id: userId, // ✅ FIXED
        ...formData
      });

      const updatedSuggestions = newData.suggestions.map((item, index) => {
        return loggedItems[index] ? result.suggestions[index] : item;
      });

      setResult({
        ...newData,
        suggestions: updatedSuggestions
      });

    } catch {
      alert("Refresh failed");
    }
  };


  // =========================
  // LOG HANDLER
  // =========================
  const handleLog = async (item, index) => {
    const userId = getUserId();
    if (!userId) return;

    try {

      if (result.action === "food") {
        await logFood({
          user_id: userId, // ✅ FIXED
          mood: formData.mood,
          craving: formData.craving,
          food_name: item.name,
          calories: item.calories
        });
      } else {
        await logExercise({
          user_id: userId, // ✅ FIXED
          mood: formData.mood,
          craving: formData.craving,
          exercise_name: item.exercise,
          calories_burned: item.calories_burned
        });
      }

      setLoggedItems(prev => ({
        ...prev,
        [index]: true
      }));

    } catch {
      alert("Logging failed");
    }
  };

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setUserData(snap.data());
      }
    } catch (err) {
      console.error(err);
    }
  });

  return () => unsubscribe();
}, []);


  // =========================
  // REASON TEXT
  // =========================
  const getReadableReason = (reason) => {
    const map = {
      emotional_eating: "You are craving food due to emotional state",
      true_hunger: "Your body genuinely needs energy",
      dehydration_craving: "You might be dehydrated",
      low_sleep_energy_drop: "Lack of sleep is causing low energy",
      dopamine_reward_craving: "You're craving high-reward foods",
      electrolyte_imbalance: "Possible salt/mineral imbalance",
      taste_stimulation: "You are seeking strong taste stimulation",
      low_activity_fatigue: "Low activity is affecting your energy",
      general_craving: "General craving without a strong cause"
    };
    return map[reason] || reason;
  };


  const moods = [
    { label: "happy", emoji: "😊" },
    { label: "stressed", emoji: "😰" },
    { label: "tired", emoji: "😴" },
    { label: "anxious", emoji: "😟" },
    { label: "energetic", emoji: "⚡" },
    { label: "sad", emoji: "😢" }
  ];

  const cravings = [
    { label: "sweet", emoji: "🍩" },
    { label: "salty", emoji: "🧂" },
    { label: "spicy", emoji: "🌶️" },
    { label: "fast food", emoji: "🍕" },
    { label: "creamy", emoji: "🧀" }
  ];


return (
  <>
    <Header userName={userData?.basicProfile?.name || "U"} />

    <div className={styles.page}>
      <div className={styles.container}>
        <h1>How are you feeling?</h1>
        <p className={styles.subtitle}>
          We'll suggest healthy alternatives for your cravings
        </p>

        <div className={styles.card}>
          <h3>Your Mood</h3>

          <div className={styles.grid}>
            {moods.map((m) => (
              <div
                key={m.label}
                className={`${styles.moodCard} ${
                  formData.mood === m.label ? styles.selected : ""
                }`}
                onClick={() =>
                  setFormData({ ...formData, mood: m.label })
                }
              >
                <div className={styles.emoji}>{m.emoji}</div>
                <p>{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3>Any Cravings?</h3>

          <div className={styles.chips}>
            {cravings.map((c) => (
              <div
                key={c.label}
                className={`${styles.chip} ${
                  formData.craving === c.label ? styles.active : ""
                }`}
                onClick={() =>
                  setFormData({ ...formData, craving: c.label })
                }
              >
                {c.emoji} {c.label}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3>Hunger Level: {formData.hunger_level}</h3>
          <input
            type="range"
            min="1"
            max="10"
            name="hunger_level"
            value={formData.hunger_level}
            onChange={handleSliderChange}
            className={styles.slider}
            style={{
              "--slider-pct": `${((formData.hunger_level - 1) / 9) * 100}%`,
            }}
          />
        </div>

        <div className={styles.card}>
          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="did_eat"
              checked={formData.did_eat}
              onChange={handleChange}
            />
            <span className={styles.checkmark}></span>
            Already ate something
          </label>
        </div>

        <button
          className={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "✨ Analyzing..." : "Get Suggestion"}
        </button>

        {result && (
          <button className={styles.refreshBtn} onClick={handleRefresh}>
            🔄 Refresh Suggestions
          </button>
        )}

        {result && (
          <div className={styles.resultCard}>
            <h2>{result.message}</h2>

            <p className={styles.reason}>
              🧠 {getReadableReason(result.reason)}
            </p>

            <div className={styles.resultGrid}>
              {result.suggestions?.map((item, i) => {
                const isLogged = loggedItems[i];

                return (
                  <div key={i} className={styles.resultBox}>
                    <h4>{item.name || item.exercise}</h4>

                    <p>
                      {item.calories
                        ? `${item.calories} kcal`
                        : `${item.duration_min} min • ${item.calories_burned} kcal`}
                    </p>

                    <button
                      className={`${styles.logBtn} ${
                        isLogged ? styles.logged : ""
                      }`}
                      disabled={isLogged}
                      onClick={() => handleLog(item, i)}
                    >
                      {isLogged ? "✓ Logged" : "Log"}
                    </button>
                  </div>
                );
              })}
            </div>

            <p className={styles.calories}>
              🔥 Remaining Calories: {result.remaining_calories}
            </p>
          </div>
        )}
      </div>
    </div>
  </>
);
}