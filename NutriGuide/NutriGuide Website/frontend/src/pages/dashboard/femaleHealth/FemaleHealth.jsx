import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import Header from "../../../components/navigation/Header";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./FemaleHealth.module.css";

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── PHASE DATA ───────────────────────────────────────────
const PHASE_INFO = {
  menstrual: {
    label: "Menstrual Phase",
    number: 1,
    color: "#ff6b9d",
    bg: "#fff0f5",
    days: "Day 1–5",
    emoji: "🩸",
    uterusEmoji: "🌸",
    whatHappens: "This phase marks the start of your cycle, where the uterine lining sheds and exits the body as menstrual blood. Hormone levels are at their lowest.",
    symptoms: "You may experience cramps, fatigue, mood swings, lower back pain, and headaches.",
    fertilization: "Low",
    fertilizationColor: "#6b7280",
    fertilizationNote: "Very low; your body is shedding the unfertilized egg.",
    recommendations: {
      nutrition: ["Iron-rich foods like spinach", "Dark chocolate & nuts", "Warm soups and herbal teas", "Avoid caffeine and salty foods"],
      exercise: ["Gentle yoga and stretching", "Light walks in nature", "Rest and restorative poses", "Avoid high intensity"],
      selfCare: ["Warm heating pad", "Extra sleep and rest", "Journaling and reflection", "Soothing baths"],
    },
  },
  follicular: {
    label: "Follicular Phase",
    number: 2,
    color: "#4fc3f7",
    bg: "#f0faff",
    days: "Day 1–14",
    emoji: "🌱",
    uterusEmoji: "🌿",
    whatHappens: "Estrogen rises as follicles in the ovaries mature. The uterine lining begins to thicken. You feel increasingly energized and focused.",
    symptoms: "Rising energy, improved mood, clearer skin, and increased mental clarity are common.",
    fertilization: "Low–Medium",
    fertilizationColor: "#f59e0b",
    fertilizationNote: "Increasing as ovulation approaches; fertile window begins.",
    recommendations: {
      nutrition: ["Lean proteins and fermented foods", "Fresh vegetables and sprouted grains", "Probiotic-rich yogurt", "Eggs and seeds"],
      exercise: ["HIIT and strength training", "Dance or cardio classes", "Try a new physical activity", "Running and cycling"],
      selfCare: ["Social activities and networking", "Start creative projects", "Set new goals and intentions", "Learn something new"],
    },
  },
  ovulation: {
    label: "Ovulation",
    number: 3,
    color: "#ffb74d",
    bg: "#fffbf0",
    days: "Day 14",
    emoji: "✨",
    uterusEmoji: "⭐",
    whatHappens: "A mature egg is released from the ovary. Estrogen peaks and LH surges. This is your most fertile day — energy and confidence are at their highest.",
    symptoms: "Clear stretchy discharge, slight temperature rise, mild pelvic twinge, heightened libido.",
    fertilization: "Peak",
    fertilizationColor: "#16a34a",
    fertilizationNote: "Highest fertility window — the egg is released and viable for 12–24 hours.",
    recommendations: {
      nutrition: ["Antioxidant-rich berries", "Zinc from pumpkin seeds", "Leafy greens and avocado", "Stay well hydrated"],
      exercise: ["High intensity workouts", "Group fitness classes", "Competitive sports", "Push your personal bests"],
      selfCare: ["Schedule important meetings", "Date nights and socializing", "Express yourself creatively", "Collaborate with others"],
    },
  },
  luteal: {
    label: "Luteal Phase",
    number: 4,
    color: "#9575cd",
    bg: "#f5f0ff",
    days: "Day 15–28",
    emoji: "🌙",
    uterusEmoji: "🌕",
    whatHappens: "Progesterone rises after ovulation to prepare the uterus for a potential pregnancy. If no fertilization occurs, hormone levels drop and PMS symptoms may appear.",
    symptoms: "Bloating, mood swings, breast tenderness, fatigue, food cravings, and irritability.",
    fertilization: "Low",
    fertilizationColor: "#6b7280",
    fertilizationNote: "Low; the fertile window has passed for this cycle.",
    recommendations: {
      nutrition: ["Magnesium-rich dark chocolate", "Complex carbs and sweet potato", "Chamomile tea and warm foods", "Reduce sugar and alcohol"],
      exercise: ["Moderate yoga and pilates", "Swimming and gentle cycling", "Evening walks", "Avoid overexertion"],
      selfCare: ["Journaling and self-reflection", "Reduce social commitments", "Prioritize sleep hygiene", "Meditation and breathwork"],
    },
  },
};

// ─── FLOATING ORBS COMPONENT ─────────────────────────────
function FloatingOrbs() {
  return (
    <div className={styles.orbsContainer} aria-hidden="true">
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />
      <div className={`${styles.orb} ${styles.orb4}`} />
      <div className={`${styles.orb} ${styles.orb5}`} />
    </div>
  );
}

// ─── PHASE POPUP ─────────────────────────────────────────
function PhasePopup({ phase, currentPhase, onClose }) {
  const info = PHASE_INFO[phase];
  const isCurrent = phase === currentPhase;
  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.popupClose} onClick={onClose}>×</button>

        <div className={styles.popupHeader} style={{ background: info.bg }}>
          <div className={styles.popupUterus}>{info.uterusEmoji}</div>
          <h2 className={styles.popupTitle}>{info.label}</h2>
          {isCurrent && <span className={styles.popupCurrentBadge}>Current phase</span>}
          <p className={styles.popupDays}>{info.days}</p>
        </div>

        <div className={styles.popupBody}>
          <div className={styles.popupSection}>
            <h4 className={styles.popupSectionTitle}>What Happens:</h4>
            <p className={styles.popupSectionText}>{info.whatHappens}</p>
          </div>
          <div className={styles.popupSection}>
            <h4 className={styles.popupSectionTitle}>Symptoms:</h4>
            <p className={styles.popupSectionText}>{info.symptoms}</p>
          </div>
          <div className={styles.popupSection}>
            <h4 className={styles.popupSectionTitle}>
              Fertilization Chances:{" "}
              <span className={styles.fertBadge} style={{ background: info.fertilizationColor }}>
                {info.fertilization}
              </span>
            </h4>
            <p className={styles.popupSectionText}>{info.fertilizationNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FemaleHealth() {
  const [user, setUser] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [userData, setUserData] = useState(null);

  const [mood, setMood] = useState(3);
  const [flow, setFlow] = useState(3);
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState("");

  const [showLogPeriod, setShowLogPeriod] = useState(false);
  const [selectedLogDate, setSelectedLogDate] = useState(null);
  const [loggedPeriodStart, setLoggedPeriodStart] = useState(null);

  const [cycleLogs, setCycleLogs] = useState([]);
  const [selectedPhasePopup, setSelectedPhasePopup] = useState(null);

  // 🔹 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => u && setUser(u));
    return () => unsub();
  }, []);

  // 🔹 FETCH
  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setPeriodData(data?.healthProfile?.period);
        setUserData(data); 
        const savedOverride = data?.healthProfile?.period?.correctedPeriodDate;
        if (savedOverride) setLoggedPeriodStart(savedOverride.toDate());
      }
      const logsSnap = await getDocs(collection(db, "users", user.uid, "cycleLogs"));
      setCycleLogs(logsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchAll();
  }, [user]);

  const refreshLogs = async () => {
    const logsSnap = await getDocs(collection(db, "users", user.uid, "cycleLogs"));
    setCycleLogs(logsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // 🔥 CORE LOGIC
  const cycle = useMemo(() => {
    if (!periodData) return null;
    const last = loggedPeriodStart ?? periodData.lastPeriodDate.toDate();
    const cycleLength = periodData.cycleLength;
    const periodLength = periodData.periodLength;
    const today = new Date();

    const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    const cyclesPassed = Math.floor(diff / cycleLength);
    const currentCycleStart = new Date(last);
    currentCycleStart.setDate(last.getDate() + cyclesPassed * cycleLength);

    const nextPeriod = new Date(currentCycleStart);
    nextPeriod.setDate(currentCycleStart.getDate() + cycleLength);

    const currentDay = (diff % cycleLength) + 1;
    const ovulationDay = cycleLength - 14;
    const ovulationDate = new Date(currentCycleStart);
    ovulationDate.setDate(currentCycleStart.getDate() + ovulationDay - 1);

    let phase, phaseLabel, phaseSigns, phaseEmoji, energyLevel, pmsRisk, phaseColor;

    if (currentDay <= periodLength) {
      phase = "menstrual"; phaseLabel = "Menstrual Phase";
      phaseSigns = "Bleeding, low energy"; phaseEmoji = "🩸";
      energyLevel = "Low"; pmsRisk = "None"; phaseColor = "#ff6b9d";
    } else if (currentDay < ovulationDay) {
      phase = "follicular"; phaseLabel = "Follicular Phase";
      phaseSigns = "Rising energy, thickening uterine lining"; phaseEmoji = "🌱";
      energyLevel = "Rising"; pmsRisk = "None"; phaseColor = "#4fc3f7";
    } else if (currentDay === ovulationDay) {
      phase = "ovulation"; phaseLabel = "Ovulation";
      phaseSigns = "Clear, stretchy discharge; slight temperature rise"; phaseEmoji = "✨";
      energyLevel = "Peak"; pmsRisk = "None"; phaseColor = "#ffb74d";
    } else {
      phase = "luteal"; phaseLabel = "Luteal Phase";
      phaseSigns = "PMS symptoms like bloating or mood swings"; phaseEmoji = "🌙";
      const lutealDay = currentDay - ovulationDay;
      const lutealLength = cycleLength - ovulationDay;
      energyLevel = lutealDay > lutealLength / 2 ? "Declining" : "Moderate";
      pmsRisk = lutealDay > lutealLength / 2 ? "High" : "Moderate";
      phaseColor = "#9575cd";
    }

    return {
      cycleLength, periodLength, last, currentDay, ovulationDay, nextPeriod,
      phase, phaseLabel, phaseSigns, phaseEmoji, energyLevel, pmsRisk, phaseColor,
      daysRemaining: Math.max(0, Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24))),
      daysToOvulation: Math.max(0, Math.ceil((ovulationDate - today) / (1000 * 60 * 60 * 24))),
      progress: Math.min(100, Math.round((currentDay / cycleLength) * 100)),
    };
  }, [periodData, loggedPeriodStart]);

  // 🔥 CALENDAR
  const calendar = useMemo(() => {
    if (!cycle) return [];
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const firstDay = start.getDay();
    const days = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) days.push(null);

    for (let i = 1; i <= end.getDate(); i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const diff = Math.floor((date - cycle.last) / (1000 * 60 * 60 * 24));
      const cycleDay =
        ((diff % cycle.cycleLength) + cycle.cycleLength) % cycle.cycleLength + 1;

      let type = "";
      if (cycleDay <= cycle.periodLength) type = "menstrual";
      else if (cycleDay < cycle.ovulationDay) type = "follicular";
      else if (cycleDay === cycle.ovulationDay) type = "ovulation";
      else type = "luteal";

      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const isSelected =
        selectedLogDate &&
        date.getDate() === selectedLogDate.getDate() &&
        date.getMonth() === selectedLogDate.getMonth() &&
        date.getFullYear() === selectedLogDate.getFullYear();

      days.push({ day: i, type, isToday, isSelected, dateObj: date });
    }
    return days;
  }, [cycle, currentMonth, selectedLogDate]);

  // 🔥 ANALYTICS
  const analytics = useMemo(() => {
    if (!cycleLogs.length) return null;

    const moodLogs = cycleLogs.filter((l) => l.type === "mood" && l.mood);
    const avgMood = moodLogs.length
      ? ((moodLogs.reduce((s, l) => s + l.mood, 0) / moodLogs.length) * 2).toFixed(1)
      : "—";

    const periodStartLogs = cycleLogs
      .filter((l) => l.type === "periodStart" && l.periodStartDate)
      .map((l) => ({
        date: l.periodStartDate?.toDate ? l.periodStartDate.toDate() : new Date(l.periodStartDate),
      }))
      .sort((a, b) => a.date - b.date);

    const cycleTrend = [];
    for (let i = 1; i < periodStartLogs.length; i++) {
      const diff = Math.round(
        (periodStartLogs[i].date - periodStartLogs[i - 1].date) / (1000 * 60 * 60 * 24)
      );
      cycleTrend.push({
        month: periodStartLogs[i].date.toLocaleString("default", { month: "short" }),
        days: diff,
      });
    }

    const avgCycleLength = cycleTrend.length
      ? (cycleTrend.reduce((s, c) => s + c.days, 0) / cycleTrend.length).toFixed(1)
      : "—";

    const flowLogs = cycleLogs
      .filter((l) => l.type === "flow" && l.flow)
      .map((l) => ({
        date: l.date?.toDate ? l.date.toDate() : new Date(l.date),
        flow: l.flow,
      }))
      .sort((a, b) => a.date - b.date);

    let periodDurationDays = 0;
    if (flowLogs.length > 0) {
      const distinctDays = new Set(flowLogs.map((l) => l.date.toDateString()));
      if (periodStartLogs.length > 0) {
        let totalDays = 0, counted = 0;
        periodStartLogs.forEach((ps) => {
          const windowDays = [...distinctDays].filter((ds) => {
            const d = new Date(ds);
            const diff = Math.floor((d - ps.date) / (1000 * 60 * 60 * 24));
            return diff >= 0 && diff <= 10;
          });
          totalDays += windowDays.length;
          counted++;
        });
        periodDurationDays = counted > 0 ? (totalDays / counted).toFixed(1) : flowLogs.length;
      } else {
        periodDurationDays = distinctDays.size;
      }
    }

    const avgPeriodDuration = periodDurationDays > 0 ? periodDurationDays : "—";

    const symptomCount = {};
    cycleLogs
      .filter((l) => l.type === "symptoms")
      .forEach((l) => {
        (l.symptoms || []).forEach((s) => {
          symptomCount[s] = (symptomCount[s] || 0) + 1;
        });
      });
    const symptomData = Object.entries(symptomCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const finalTrend = cycleTrend.length >= 2
      ? cycleTrend
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, i) => ({
          month,
          days: 27 + Math.round(Math.sin(i) * 1.2),
        }));

    return { avgMood, avgCycleLength, avgPeriodDuration, cycleTrend: finalTrend, symptomData };
  }, [cycleLogs]);

  // 🔥 SAVES
  const saveLoggedPeriod = async () => {
    if (!selectedLogDate || !user) return;
    await addDoc(collection(db, "users", user.uid, "cycleLogs"), {
      type: "periodStart",
      periodStartDate: selectedLogDate,
      date: new Date(),
    });
    await setDoc(
      doc(db, "users", user.uid),
      { healthProfile: { period: { correctedPeriodDate: selectedLogDate } } },
      { merge: true }
    );
    setLoggedPeriodStart(selectedLogDate);
    setShowLogPeriod(false);
    setSelectedLogDate(null);
    await refreshLogs();
    alert("Period date saved! Your cycle has been updated.");
  };

  const saveMood = async () => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "cycleLogs"), {
      type: "mood",
      mood: parseInt(mood),
      notes,
      date: new Date(),
    });
    await refreshLogs();
    alert("Mood saved!");
  };

  const saveFlow = async () => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "cycleLogs"), {
      type: "flow",
      flow: parseInt(flow),
      date: new Date(),
    });
    await refreshLogs();
    alert("Flow saved!");
  };

  const saveSymptoms = async () => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "cycleLogs"), {
      type: "symptoms",
      symptoms,
      date: new Date(),
    });
    await refreshLogs();
    alert("Symptoms saved!");
  };

  const toggleSymptom = (s) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  if (!cycle) return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingOrb} />
      <p>Loading your cycle data…</p>
    </div>
  );

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });
  const currentRec = PHASE_INFO[cycle.phase]?.recommendations;
  const phaseInfo = PHASE_INFO[cycle.phase];
 
  return (
     <>
    <Header userName={userData?.basicProfile?.name} />
    <div className={styles.wrapper}>
      <FloatingOrbs />
      

      {/* ════════════════════════════════════════ */}
      {/* 🔥 HERO TOP CARD                         */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.topCard}>
        {/* Decorative rings */}
        <div className={styles.ringDeco1} />
        <div className={styles.ringDeco2} />
        <div className={styles.ringDeco3} />

        <div className={styles.left}>
          <div className={styles.status}>
            <span className={styles.statusDot} />
            <span>Your Cycle Status</span>
          </div>
          <h2 className={styles.title}>Next Period</h2>
          <h1 className={styles.days}>
            <span className={styles.daysNum}>{cycle.daysRemaining}</span>
            <span className={styles.daysSuffix}>days</span>
          </h1>
          <p className={styles.sub}>Remaining until your next cycle</p>

          <div className={styles.phasePillHero} style={{ background: `${phaseInfo.color}22`, borderColor: phaseInfo.color }}>
            <span>{phaseInfo.emoji}</span>
            <span style={{ color: phaseInfo.color, fontWeight: 700 }}>{phaseInfo.label}</span>
            <span className={styles.phasePillDay}>Day {cycle.currentDay}</span>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.cardBox}>
            <div className={styles.cardBoxIcon}>✨</div>
            <span className={styles.cardBoxLabel}>Ovulation</span>
            <h2 className={styles.cardBoxNum}>{cycle.daysToOvulation}</h2>
            <span className={styles.cardBoxSub}>Days away</span>
          </div>
        </div>

        <div className={styles.fullProgress}>
          <div className={styles.progressTop}>
            <span>Cycle Progress</span>
            <span className={styles.progressPct}>{cycle.progress}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${cycle.progress}%` }}
            >
              <div className={styles.progressGlow} />
            </div>
          </div>
          <div className={styles.progressLabels}>
            <span>Day 1</span>
            <span>Day {Math.floor(cycle.cycleLength / 2)}</span>
            <span>Day {cycle.cycleLength}</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* 🔥 PHASE BANNER                          */}
      {/* ════════════════════════════════════════ */}
      <div
        className={styles.phaseBanner}
        style={{ borderColor: phaseInfo.color, background: `${phaseInfo.color}12` }}
      >
        <div className={styles.phaseLeft}>
          <div className={styles.phaseEmojiWrap} style={{ background: `${phaseInfo.color}22` }}>
            <span className={styles.phaseEmoji}>{phaseInfo.emoji}</span>
          </div>
          <div>
            <p className={styles.phaseTag}>You are in</p>
            <h3 className={styles.phaseTitle} style={{ color: phaseInfo.color }}>
              {phaseInfo.label}
            </h3>
            <p className={styles.phaseSigns}>Day {cycle.currentDay} · {cycle.phaseSigns}</p>
          </div>
        </div>
        <div className={styles.phaseStats}>
          <div className={styles.phaseStat}>
            <span className={styles.phaseStatLabel}>⚡ Energy</span>
            <span className={styles.phaseStatValue} style={{
              color: cycle.energyLevel === "Peak" ? "#22c55e"
                : cycle.energyLevel === "Rising" ? "#4fc3f7"
                : cycle.energyLevel === "Moderate" ? "#ffb74d" : "#e57373",
            }}>{cycle.energyLevel}</span>
          </div>
          <div className={styles.phaseStat}>
            <span className={styles.phaseStatLabel}>🌧 PMS Risk</span>
            <span className={styles.phaseStatValue} style={{
              color: cycle.pmsRisk === "None" ? "#22c55e"
                : cycle.pmsRisk === "Moderate" ? "#ffb74d" : "#e57373",
            }}>{cycle.pmsRisk}</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* 🔥 LOG PERIOD                            */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.logPeriodRow}>
        <button
          className={styles.logPeriodBtn}
          onClick={() => { setShowLogPeriod((p) => !p); setSelectedLogDate(null); }}
        >
          🩸 {showLogPeriod ? "Cancel" : "Log Period Date"}
        </button>
        {showLogPeriod && (
          <p className={styles.logPeriodHint}>
            👆 Tap any date on the calendar below to mark your period start date
          </p>
        )}
      </div>

      {showLogPeriod && selectedLogDate && (
        <div className={styles.confirmBar}>
          <span>
            🩸 Period started on{" "}
            <strong>
              {selectedLogDate.toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </strong>
          </span>
          <button className={styles.confirmBtn} onClick={saveLoggedPeriod}>
            Confirm & Save
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* 🔥 MAIN GRID                             */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.grid}>

        {/* LEFT COLUMN */}
        <div className={styles.leftCol}>

          {/* CALENDAR */}
          <div className={styles.card}>
            <div className={styles.calendarHeader}>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>‹</button>
              <h3>{monthName}</h3>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>›</button>
            </div>
            <div className={styles.daysRow}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className={styles.calendarGrid}>
              {calendar.map((d, i) =>
                d ? (
                  <div
                    key={i}
                    className={`${styles.day} ${styles[d.type]} ${d.isToday ? styles.today : ""} ${d.isSelected ? styles.selectedDay : ""} ${showLogPeriod ? styles.clickable : ""}`}
                    onClick={() => { if (showLogPeriod) setSelectedLogDate(d.dateObj); }}
                  >
                    {d.day}
                    {d.isToday && <span className={styles.todayDot} />}
                    {d.isSelected && <span className={styles.selectedDot} />}
                  </div>
                ) : <div key={i} />
              )}
            </div>
            <div className={styles.legend}>
              {[
                { type: "menstrual", label: "Menstrual" },
                { type: "follicular", label: "Follicular" },
                { type: "ovulation", label: "Ovulation" },
                { type: "luteal", label: "Luteal" },
              ].map(({ type, label }) => (
                <div key={type} className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles[`dot_${type}`]}`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MINI STATS */}
          <div className={styles.miniStats}>
            {[
              { icon: "📅", bg: "#fff0f5", label: "Avg Cycle", value: analytics?.avgCycleLength !== "—" ? analytics?.avgCycleLength : cycle.cycleLength, unit: " days" },
              { icon: "🩸", bg: "#fff0f5", label: "Period Duration", value: analytics?.avgPeriodDuration !== "—" ? analytics?.avgPeriodDuration : cycle.periodLength, unit: " days" },
              { icon: "💜", bg: "#f5f0ff", label: "Mood Score", value: analytics?.avgMood !== "—" ? analytics?.avgMood : "—", unit: " /10" },
            ].map(({ icon, bg, label, value, unit }) => (
              <div key={label} className={styles.miniStatCard}>
                <div className={styles.miniStatIcon} style={{ background: bg }}>{icon}</div>
                <div>
                  <p className={styles.miniStatLabel}>{label}</p>
                  <p className={styles.miniStatValue}>{value}<span className={styles.miniStatUnit}>{unit}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN — DAILY LOG */}
        <div className={styles.card}>
          <h3 className={styles.dailyLogTitle}>Daily Log</h3>

          <div className={styles.logSection}>
            <p className={styles.logLabel}>How are you feeling today?</p>
            <div className={styles.moods}>
              {[
                { emoji: "😊", label: "Great" },
                { emoji: "😀", label: "Good" },
                { emoji: "😐", label: "Okay" },
                { emoji: "😔", label: "Low" },
                { emoji: "😢", label: "Sad" },
              ].map((m, i) => (
                <button
                  key={i}
                  className={`${styles.moodBtn} ${mood === i + 1 ? styles.activeMood : ""}`}
                  onClick={() => setMood(i + 1)}
                >
                  <span className={styles.moodEmoji}>{m.emoji}</span>
                  <span className={styles.moodLabel}>{m.label}</span>
                </button>
              ))}
            </div>
            <textarea
              placeholder="Add a note about your mood..."
              value={notes}
              className={styles.notesArea}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button className={`${styles.saveBtn} ${styles.saveMoodBtn}`} onClick={saveMood}>
              💜 Save Mood
            </button>
          </div>

          <div className={styles.logDivider} />

          <div className={styles.logSection}>
            <div className={styles.flowHeader}>
              <p className={styles.logLabel}>Flow Intensity</p>
              <span className={styles.flowValue}>{flow}/5</span>
            </div>
            <input
              type="range" min="1" max="5" value={flow}
              className={styles.flowSlider}
              style={{ "--val": flow }}
              onChange={(e) => setFlow(Number(e.target.value))}
            />
            <div className={styles.flowTicks}>
              {[1, 2, 3, 4, 5].map((n) => <span key={n}>{n}</span>)}
            </div>
            <button className={`${styles.saveBtn} ${styles.saveFlowBtn}`} onClick={saveFlow}>
              🩸 Save Flow
            </button>
          </div>

          <div className={styles.logDivider} />

          <div className={styles.logSection}>
            <p className={styles.logLabel}>
              Symptoms <span className={styles.logLabelSub}>(select all that apply)</span>
            </p>
            <div className={styles.symptoms}>
              {["Cramps", "Headache", "Fatigue", "Acne", "Bloating", "Back Pain", "Breast Tenderness", "Mood Swings"].map((s) => (
                <span
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`${styles.symptomChip} ${symptoms.includes(s) ? styles.activeSymptom : ""}`}
                >
                  {s}
                </span>
              ))}
            </div>
            <button className={`${styles.saveBtn} ${styles.saveSymptomsBtn}`} onClick={saveSymptoms}>
              🌸 Save Symptoms
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* 🔥 INSIGHTS & ANALYTICS                 */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.analyticsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Insights & Analytics</h2>
          <div className={styles.sectionLine} />
        </div>

        <div className={styles.chartsRow}>
          <div className={styles.chartCard}>
            <h4 className={styles.chartTitle}>📈 Cycle Length Trends</h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics?.cycleTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce4ec" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#e91e8c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #fce4ec", fontSize: 12, background: "#fff" }}
                  formatter={(v) => [`${v} days`, "Cycle"]}
                />
                <Line type="monotone" dataKey="days" stroke="url(#lineGrad)" strokeWidth={3}
                  dot={{ fill: "#ff6b9d", r: 5, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ff6b9d" />
                    <stop offset="100%" stopColor="#9575cd" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h4 className={styles.chartTitle}>🌸 Common Symptoms</h4>
            {analytics?.symptomData?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.symptomData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce4ec" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e91e8c" }}
                    axisLine={false} tickLine={false} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #fce4ec", fontSize: 12 }}
                    formatter={(v) => [`${v} times`, "Logged"]}
                  />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b9d" />
                      <stop offset="100%" stopColor="#ce93d8" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>
                <span className={styles.noDataEmoji}>📊</span>
                <p>Log symptoms to see your trends here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* 🔥 RECOMMENDATIONS                      */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.recoSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.recoIcon}>💡</span>
            Recommendations
          </h2>
          <span className={styles.recoBadge} style={{ background: `${phaseInfo.color}22`, color: phaseInfo.color }}>
            {phaseInfo.emoji} {phaseInfo.label}
          </span>
          <div className={styles.sectionLine} />
        </div>

        <div className={styles.recoCards}>
          {[
            { key: "nutrition", icon: "🥗", title: "Nutrition", color: "#22c55e", bg: "#f0fdf4" },
            { key: "exercise", icon: "💪", title: "Exercise", color: "#f59e0b", bg: "#fffbeb" },
            { key: "selfCare", icon: "✨", title: "Self-Care", color: "#a855f7", bg: "#faf5ff" },
          ].map(({ key, icon, title, color, bg }) => (
            <div key={key} className={styles.recoCard} style={{ "--reco-color": color, "--reco-bg": bg }}>
              <div className={styles.recoCardHeader}>
                <span className={styles.recoCardIcon} style={{ background: bg }}>{icon}</span>
                <h4 className={styles.recoCardTitle} style={{ color }}>{title}</h4>
              </div>
              <ul className={styles.recoList}>
                {(currentRec?.[key] || []).map((item, i) => (
                  <li key={i} className={styles.recoItem}>
                    <span className={styles.recoDot} style={{ background: color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* 🔥 MENSTRUAL CYCLE PHASES               */}
      {/* ════════════════════════════════════════ */}
      <div className={styles.phasesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Menstrual Cycle Phases</h2>
          <div className={styles.sectionLine} />
        </div>

        <div className={styles.phaseCards}>
          {Object.entries(PHASE_INFO).map(([key, info]) => {
            const isCurrent = key === cycle.phase;
            return (
              <div
                key={key}
                className={`${styles.phaseCard} ${isCurrent ? styles.phaseCardActive : ""}`}
                style={{ "--phase-color": info.color }}
                onClick={() => setSelectedPhasePopup(key)}
              >
                {isCurrent && <div className={styles.phaseCardCurrentRibbon}>Current</div>}
                <div className={styles.phaseCardNum} style={{ background: info.color }}>
                  {info.number}
                </div>
                <div className={styles.phaseCardBody}>
                  <div className={styles.phaseCardUterus}>{info.uterusEmoji}</div>
                  <h4 className={styles.phaseCardLabel} style={{ color: info.color }}>{info.label}</h4>
                  <p className={styles.phaseCardDays}>{info.days}</p>
                </div>
                <div className={styles.phaseCardHover}>
                  <span>Tap to learn more →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* 🔥 PHASE POPUP                          */}
      {/* ════════════════════════════════════════ */}
      {selectedPhasePopup && (
        <PhasePopup
          phase={selectedPhasePopup}
          currentPhase={cycle.phase}
          onClose={() => setSelectedPhasePopup(null)}
        />
      )}
    </div>
 </>
  );
}