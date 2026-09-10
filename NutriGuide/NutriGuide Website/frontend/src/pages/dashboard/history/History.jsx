import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase";
import Header from "../../../components/navigation/Header";
import styles from "./History.module.css";

// ── helpers ──────────────────────────────────────────────────────────────────
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

function parseDate(dateStr) {
  // dateStr is "YYYY-MM-DD"
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateLabel(dateStr) {
  const d = parseDate(dateStr);
  const isToday = d.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function formatMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function groupByDate(items) {
  const map = {};
  items.forEach((item) => {
    if (!map[item.date]) map[item.date] = [];
    map[item.date].push(item);
  });
  return map;
}

function groupByMonth(items) {
  const map = {};
  items.forEach((item) => {
    const d = parseDate(item.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map[key]) map[key] = { year: d.getFullYear(), month: d.getMonth(), items: [] };
    map[key].items.push(item);
  });
  return map;
}

// ── sub components ────────────────────────────────────────────────────────────
function MealCard({ meal }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardIcon}>🍽️</div>
      <div className={styles.cardBody}>
        <p className={styles.cardName}>{meal.name}</p>
        <span className={styles.mealBadge}>{meal.mealType}</span>
      </div>
      <div className={styles.cardMacros}>
        <span className={styles.calPill}>{meal.calories} kcal</span>
        <div className={styles.macroRow}>
          <span>P <b>{meal.protein}g</b></span>
          <span>C <b>{meal.carbs}g</b></span>
          <span>F <b>{meal.fats}g</b></span>
        </div>
      </div>
    </div>
  );
}

function ExerciseCard({ ex }) {
  return (
    <div className={`${styles.card} ${styles.exCard}`}>
      <div className={styles.cardIcon}>🏃</div>
      <div className={styles.cardBody}>
        <p className={styles.cardName}>{ex.name}</p>
        <span className={styles.exBadge}>{ex.duration} min</span>
      </div>
      <div className={styles.cardMacros}>
        <span className={`${styles.calPill} ${styles.exPill}`}>{ex.calories} kcal</span>
      </div>
    </div>
  );
}

function DayBlock({ dateStr, meals, exercises }) {
  const [open, setOpen] = useState(true);
  const totalMealCal = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalExCal = exercises.reduce((s, e) => s + (e.calories || 0), 0);

  return (
    <div className={styles.dayBlock}>
      <button className={styles.dayHeader} onClick={() => setOpen((v) => !v)}>
        <span className={styles.dayLabel}>{formatDateLabel(dateStr)}</span>
        <div className={styles.daySummary}>
          {meals.length > 0 && <span>🍽 {totalMealCal} kcal</span>}
          {exercises.length > 0 && <span>🏃 {totalExCal} kcal burned</span>}
        </div>
        <span className={`${styles.chevron} ${open ? styles.open : ""}`}>›</span>
      </button>
      {open && (
        <div className={styles.dayContent}>
          {meals.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Meals</p>
              {meals.map((m) => <MealCard key={m.id} meal={m} />)}
            </div>
          )}
          {exercises.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Exercises</p>
              {exercises.map((e) => <ExerciseCard key={e.id} ex={e} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MonthBlock({ year, month, meals, exercises }) {
  const [open, setOpen] = useState(false);
  const totalMealCal = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalExCal = exercises.reduce((s, e) => s + (e.calories || 0), 0);
  const uniqueDays = new Set([...meals.map((m) => m.date), ...exercises.map((e) => e.date)]).size;

  return (
    <div className={styles.monthBlock}>
      <button className={styles.monthHeader} onClick={() => setOpen((v) => !v)}>
        <div className={styles.monthLeft}>
          <span className={styles.monthLabel}>{formatMonthLabel(year, month)}</span>
          <span className={styles.monthDays}>{uniqueDays} active days</span>
        </div>
        <div className={styles.monthStats}>
          {totalMealCal > 0 && <span className={styles.statChip}>🍽 {totalMealCal} kcal</span>}
          {totalExCal > 0 && <span className={`${styles.statChip} ${styles.exChip}`}>🔥 {totalExCal} burned</span>}
        </div>
        <span className={`${styles.chevron} ${open ? styles.open : ""}`}>›</span>
      </button>
      {open && (
        <div className={styles.monthContent}>
          {/* group by date inside month */}
          {(() => {
            const allDates = [...new Set([...meals.map((m) => m.date), ...exercises.map((e) => e.date)])].sort().reverse();
            return allDates.map((date) => (
              <DayBlock
                key={date}
                dateStr={date}
                meals={meals.filter((m) => m.date === date)}
                exercises={exercises.filter((e) => e.date === date)}
              />
            ));
          })()}
        </div>
      )}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function History() {
  const navigate = useNavigate();
  const [uid, setUid] = useState(null);
  const [meals, setMeals] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "meals" | "exercises"

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
      else navigate("/login");
    });
    return unsub;
  }, [navigate]);

  useEffect(() => {
    if (!uid) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const mealSnap = await getDocs(
          query(collection(db, "users", uid, "loggedMeals"), orderBy("loggedAt", "desc"))
        );
        const exSnap = await getDocs(
          query(collection(db, "users", uid, "loggedExercises"), orderBy("loggedAt", "desc"))
        );
        setMeals(mealSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setExercises(exSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  // ── split current month vs past ──────────────────────────────────────────
  const isCurrentMonth = (dateStr) => {
    const d = parseDate(dateStr);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const filteredMeals = activeTab === "exercises" ? [] : meals;
  const filteredExercises = activeTab === "meals" ? [] : exercises;

  const currentMeals = filteredMeals.filter((m) => isCurrentMonth(m.date));
  const pastMeals = filteredMeals.filter((m) => !isCurrentMonth(m.date));
  const currentExercises = filteredExercises.filter((e) => isCurrentMonth(e.date));
  const pastExercises = filteredExercises.filter((e) => !isCurrentMonth(e.date));

  // dates in current month
  const currentDates = [
    ...new Set([...currentMeals.map((m) => m.date), ...currentExercises.map((e) => e.date)]),
  ].sort().reverse();

  // past months
  const pastMealsByMonth = groupByMonth(pastMeals);
  const pastExByMonth = groupByMonth(pastExercises);
  const allPastKeys = [...new Set([...Object.keys(pastMealsByMonth), ...Object.keys(pastExByMonth)])].sort().reverse();

  return (
    <>
    <Header />
    <div className={styles.page}>
      

      <div className={styles.hero}>
        <h1 className={styles.title}>Your Journey</h1>
        <p className={styles.subtitle}>Every meal, every rep — chronicled.</p>
      </div>

      {/* tab filter */}
      <div className={styles.tabs}>
        {["all", "meals", "exercises"].map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${activeTab === t ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t === "all" ? "All" : t === "meals" ? "🍽 Meals" : "🏃 Exercises"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loader}>
          <div className={styles.spinner} />
          <p>Loading your history…</p>
        </div>
      ) : (
        <div className={styles.content}>
          {/* ── This Month ── */}
          {currentDates.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.sectionDot} />
                <h2>
                  {new Date(currentYear, currentMonth).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <span className={styles.currentBadge}>This Month</span>
              </div>
              {currentDates.map((date) => (
                <DayBlock
                  key={date}
                  dateStr={date}
                  meals={currentMeals.filter((m) => m.date === date)}
                  exercises={currentExercises.filter((e) => e.date === date)}
                />
              ))}
            </section>
          )}

          {/* ── Past Months ── */}
          {allPastKeys.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={`${styles.sectionDot} ${styles.pastDot}`} />
                <h2>Past Months</h2>
              </div>
              {allPastKeys.map((key) => {
                const info = pastMealsByMonth[key] || pastExByMonth[key];
                return (
                  <MonthBlock
                    key={key}
                    year={info.year}
                    month={info.month}
                    meals={pastMealsByMonth[key]?.items || []}
                    exercises={pastExByMonth[key]?.items || []}
                  />
                );
              })}
            </section>
          )}

          {currentDates.length === 0 && allPastKeys.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📋</span>
              <p>Nothing logged yet. Start tracking today!</p>
            </div>
          )}
        </div>
      )}
    </div>
 </> );
}