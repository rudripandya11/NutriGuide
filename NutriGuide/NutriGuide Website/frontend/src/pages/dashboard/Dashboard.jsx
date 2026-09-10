import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import Header from "../../components/navigation/Header";
import styles from "./Dashboard.module.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const connectFitbit = () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login first");
    return;
  }
  const authUrl = `http://localhost:5000/auth/fitbit?firebaseUid=${user.uid}`;
  window.location.href = authUrl;
};

/* ── Animated SVG background mesh ── */
const BgMesh = () => (
  <svg className={styles.bgMesh} viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="m1" cx="30%" cy="20%" r="55%">
        <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.55"/>
        <stop offset="100%" stopColor="#bbf7d0" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="m2" cx="80%" cy="70%" r="50%">
        <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.40"/>
        <stop offset="100%" stopColor="#fed7aa" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="m3" cx="60%" cy="10%" r="40%">
        <stop offset="0%" stopColor="#4ade80" stopOpacity="0.18"/>
        <stop offset="100%" stopColor="#4ade80" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="400" cy="180" rx="500" ry="400" fill="url(#m1)" className={styles.meshOrb1}/>
    <ellipse cx="1100" cy="620" rx="440" ry="360" fill="url(#m2)" className={styles.meshOrb2}/>
    <ellipse cx="820" cy="80" rx="300" ry="220" fill="url(#m3)" className={styles.meshOrb3}/>
    {Array.from({ length: 12 }).map((_, r) =>
      Array.from({ length: 20 }).map((_, c) => (
        <circle key={`${r}-${c}`} cx={c * 80 + 20} cy={r * 80 + 20} r="1.5" fill="#22c55e" opacity="0.06"/>
      ))
    )}
  </svg>
);

/* ── Decorative leaf sprigs (left side) ── */
const LeafSprig = () => (
  <svg className={styles.leafSprig} viewBox="0 0 120 600" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 580 Q40 480 55 360 Q70 240 45 120 Q30 60 60 10" stroke="#16a34a" strokeWidth="2.5" fill="none" opacity="0.22"/>
    {[
      { cx: 45, cy: 360, rx: 48, ry: 24, rot: -40, op: 0.20 },
      { cx: 55, cy: 270, rx: 40, ry: 20, rot: 30, op: 0.16 },
      { cx: 42, cy: 450, rx: 44, ry: 22, rot: -25, op: 0.18 },
      { cx: 58, cy: 180, rx: 36, ry: 18, rot: 45, op: 0.14 },
      { cx: 50, cy: 100, rx: 30, ry: 15, rot: -35, op: 0.12 },
    ].map((l, i) => (
      <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry}
        fill="#4ade80" opacity={l.op} transform={`rotate(${l.rot} ${l.cx} ${l.cy})`}/>
    ))}
  </svg>
);

/* ── Circular progress ring ── */
const RingGauge = ({ percent, value, sub, color1 = "#22c55e", color2 = "#86efac", trackColor = "#e5e7eb", size = 110 }) => {
  const r = 44;
  const circ = 2 * Math.PI * r;
  return (
    <div className={styles.ringGaugeWrap} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className={styles.ringGaugeSvg}>
        <circle cx="50" cy="50" r={r} fill="none" stroke={trackColor} strokeWidth="9"/>
        <circle cx="50" cy="50" r={r} fill="none"
          stroke={`url(#rg_${color1.replace('#','')})`}
          strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${circ * percent / 100} ${circ * (1 - percent / 100)}`}
          strokeDashoffset={circ * 0.25}
          className={styles.ringGaugeArc}
        />
        <defs>
          <linearGradient id={`rg_${color1.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color1}/>
            <stop offset="100%" stopColor={color2}/>
          </linearGradient>
        </defs>
      </svg>
      <div className={styles.ringGaugeCenter}>
        <span className={styles.ringGaugeVal}>{value}</span>
        {sub && <span className={styles.ringGaugeSub}>{sub}</span>}
      </div>
    </div>
  );
};

/* ── Health score ring (orange) ── */
const ScoreRing = ({ score }) => {
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <div className={styles.scoreRingWrap}>
      <svg viewBox="0 0 120 120" className={styles.scoreRingSvg}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#fde68a" strokeWidth="11"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#sgr)" strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${circ * score / 100} ${circ * (1 - score / 100)}`}
          strokeDashoffset={circ * 0.25}
          className={styles.ringGaugeArc}/>
        <defs>
          <linearGradient id="sgr" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316"/>
            <stop offset="100%" stopColor="#fbbf24"/>
          </linearGradient>
        </defs>
      </svg>
      <div className={styles.scoreRingCenter}>
        <span className={styles.scoreRingVal}>{score}</span>
        <span className={styles.scoreRingSub}>/100</span>
      </div>
    </div>
  );
};

/* ── Water fill tank ── */
const WaterTank = ({ percent }) => (
  <div className={styles.wTank}>
    <svg viewBox="0 0 80 110" className={styles.wTankSvg}>
      <defs>
        <clipPath id="wClip"><rect x="2" y="2" width="76" height="106" rx="18"/></clipPath>
        <linearGradient id="wGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc"/>
          <stop offset="100%" stopColor="#0ea5e9"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="76" height="106" rx="18" fill="#e0f2fe" stroke="rgba(14,165,233,0.2)" strokeWidth="1"/>
      <g clipPath="url(#wClip)">
        <rect x="0" y={108 - percent * 1.06} width="80" height={percent * 1.06 + 4} fill="url(#wGrad)" className={styles.wRise}/>
        <path d={`M0,${108 - percent * 1.06} Q10,${108 - percent * 1.06 - 7} 20,${108 - percent * 1.06} Q30,${108 - percent * 1.06 + 7} 40,${108 - percent * 1.06} Q50,${108 - percent * 1.06 - 7} 60,${108 - percent * 1.06} Q70,${108 - percent * 1.06 + 7} 80,${108 - percent * 1.06} V120 H0 Z`}
          fill="url(#wGrad)" className={styles.wWave}/>
      </g>
      {[20, 45, 62].map((x, i) => (
        <circle key={i} cx={x} cy={100 - percent * 0.9} r="2.5"
          fill="white" opacity="0.45"
          className={styles[`wBubble${i + 1}`]}/>
      ))}
    </svg>
  </div>
);

/* ── Custom recharts tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.chartTip}>
        <p className={styles.chartTipLabel}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill }} className={styles.chartTipRow}>
            {p.name}: <strong>{p.value} kcal</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ── NEW: Nutrition Report Card ── */
const NutritionReportCard = ({ todayData, waterCount, waterGoal, sleepHours, sleepGoal, steps, stepGoal }) => {
  const goals = [
    { label: 'Calories Logged', met: (todayData?.consumed || 0) >= 1200, detail: `${todayData?.consumed || 0} kcal` },
    { label: 'Calories Burned', met: (todayData?.burned || 0) >= 300, detail: `${todayData?.burned || 0} kcal` },
    { label: 'Hydration', met: waterCount >= waterGoal * 0.75, detail: `${waterCount}/${waterGoal} glasses` },
    { label: 'Sleep', met: sleepHours >= sleepGoal * 0.85, detail: `${sleepHours}h / ${sleepGoal}h goal` },
    { label: 'Steps', met: steps >= stepGoal * 0.5, detail: `${steps.toLocaleString()} steps` },
  ];
  const metCount = goals.filter(g => g.met).length;
  const grade = metCount >= 5 ? 'A+' : metCount === 4 ? 'A' : metCount === 3 ? 'B' : metCount === 2 ? 'C' : 'D';
  const gradeColor = grade.startsWith('A') ? '#16a34a' : grade === 'B' ? '#ca8a04' : '#ef4444';
  const gradeBg = grade.startsWith('A') ? '#dcfce7' : grade === 'B' ? '#fef9c3' : '#fee2e2';

  return (
    <div className={`${styles.card} ${styles.reportCard}`}>
      <div className={styles.cardHead}>
        <div className={styles.cardHeadIcon} style={{ background: gradeBg, color: gradeColor }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h3 className={styles.cardTitle}>Daily Report Card</h3>
        <div className={styles.gradeChip} style={{ background: gradeBg, color: gradeColor }}>{grade}</div>
      </div>
      <div className={styles.reportGrid}>
        {goals.map((g, i) => (
          <div key={i} className={`${styles.reportGoalRow} ${g.met ? styles.reportGoalMet : styles.reportGoalMiss}`}>
            <span className={styles.reportGoalIcon}>{g.met ? '✅' : '⭕'}</span>
            <div className={styles.reportGoalInfo}>
              <span className={styles.reportGoalLabel}>{g.label}</span>
              <span className={styles.reportGoalDetail}>{g.detail}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.reportFooter}>
        <div className={styles.reportFooterBar}>
          <div style={{ width: `${(metCount / goals.length) * 100}%`, background: `linear-gradient(90deg, ${gradeColor}, ${gradeColor}88)` }} className={styles.reportFooterFill}/>
        </div>
        <span className={styles.reportFooterTxt}>{metCount}/{goals.length} goals met today</span>
      </div>
    </div>
  );
};

/* ── NEW: Smart Pattern-Based Insights ── */
const SmartInsightsCard = ({ weeklyCalories, moodData }) => {
  const insights = [];

  if (weeklyCalories.length >= 3) {
    const highSleepDays = weeklyCalories.filter(d => d.sleep >= 7);
    const lowSleepDays = weeklyCalories.filter(d => d.sleep > 0 && d.sleep < 7);
    if (highSleepDays.length > 0 && lowSleepDays.length > 0) {
      const avgBurnHighSleep = highSleepDays.reduce((s, d) => s + d.burned, 0) / highSleepDays.length;
      const avgBurnLowSleep = lowSleepDays.reduce((s, d) => s + d.burned, 0) / lowSleepDays.length;
      if (avgBurnHighSleep > avgBurnLowSleep * 1.1) {
        insights.push({ icon: '🌙', text: `You burn ${Math.round(avgBurnHighSleep - avgBurnLowSleep)} more kcal on days you sleep 7h+`, type: 'positive' });
      }
    }

    const nightCalDays = weeklyCalories.filter(d => d.consumed > 1500 && d.burned < 400);
    if (nightCalDays.length >= 2) {
      insights.push({ icon: '🍽️', text: 'High intake on low-activity days detected — try lighter dinners', type: 'warning' });
    }

    const consistentDays = weeklyCalories.filter(d => d.consumed >= 800 && d.burned >= 200);
    if (consistentDays.length >= 5) {
      insights.push({ icon: '🔥', text: `${consistentDays.length} consistent days this week — great discipline!`, type: 'positive' });
    }

    const lowStepDays = weeklyCalories.filter(d => d.steps > 0 && d.steps < 5000);
    if (lowStepDays.length >= 3) {
      insights.push({ icon: '👟', text: 'Step count below 5K on most days — short walks can help', type: 'warning' });
    }
  }

  if (moodData && moodData.length > 0) {
    const tiredCravings = moodData.filter(m => m.mood === 'tired' && m.type === 'food');
    const happyExercise = moodData.filter(m => m.mood === 'happy' && m.type === 'exercise');
    if (tiredCravings.length >= 1) {
      insights.push({ icon: '😴', text: `When tired, you tend to crave ${tiredCravings[0]?.craving || 'comfort food'} — try herbal tea instead`, type: 'tip' });
    }
    if (happyExercise.length >= 1) {
      insights.push({ icon: '😊', text: 'You exercise more on happy days — mood is your best workout fuel!', type: 'positive' });
    }
  }

  if (insights.length === 0) {
    insights.push({ icon: '📊', text: 'Log more days to unlock personalized pattern insights', type: 'tip' });
  }

  const typeColors = {
    positive: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
    warning: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
    tip: { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1' },
  };

  return (
    <div className={`${styles.card} ${styles.smartInsightCard}`}>
      <div className={styles.cardHead}>
        <div className={styles.cardHeadIcon} style={{ background: '#fefce8', color: '#ca8a04' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <h3 className={styles.cardTitle}>Smart Insights</h3>
        <span className={styles.cardBadge} style={{ background: '#fef9c3', color: '#92400e' }}>AI</span>
      </div>
      <div className={styles.smartInsightList}>
        {insights.slice(0, 4).map((ins, i) => {
          const c = typeColors[ins.type];
          return (
            <div key={i} className={styles.smartInsightItem} style={{ background: c.bg, borderColor: c.border }}>
              <span className={styles.smartInsightEmoji}>{ins.icon}</span>
              <span className={styles.smartInsightTxt} style={{ color: c.text }}>{ins.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── NEW: Gamification Badges ── */
const BadgesCard = ({ streaks, weeklyCalories, waterCount, waterGoal }) => {
  const totalConsumed = weeklyCalories.reduce((s, d) => s + (d.consumed || 0), 0);
  const totalBurned = weeklyCalories.reduce((s, d) => s + (d.burned || 0), 0);
  const daysLogged = weeklyCalories.filter(d => d.consumed > 0).length;

  const badges = [
    { id: 'fire7', icon: '🔥', label: '7-Day Streak', desc: 'Log 7 days straight', earned: streaks.calories >= 7 },
    { id: 'hydro', icon: '💧', label: 'Hydration Master', desc: `${waterGoal} glasses/day`, earned: waterCount >= waterGoal },
    { id: 'burn', icon: '⚡', label: 'Calorie Crusher', desc: 'Burn 2000+ kcal/week', earned: totalBurned >= 2000 },
    { id: 'consistent', icon: '🎯', label: 'Consistent Logger', desc: 'Log 5+ days this week', earned: daysLogged >= 5 },
    { id: 'sleep', icon: '🌙', label: 'Sleep Champion', desc: '8h sleep streak 3 days', earned: streaks.sleep >= 3 },
    { id: 'balance', icon: '⚖️', label: 'Balanced Week', desc: 'Maintain calorie balance', earned: Math.abs(totalConsumed - totalBurned) < 500 },
  ];

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className={`${styles.card} ${styles.badgesCard}`}>
      <div className={styles.cardHead}>
        <div className={styles.cardHeadIcon} style={{ background: '#fef9c3', color: '#ca8a04' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        </div>
        <h3 className={styles.cardTitle}>Badges</h3>
        <span className={styles.cardBadge} style={{ background: '#fef9c3', color: '#92400e' }}>{earnedCount}/{badges.length}</span>
      </div>
      <div className={styles.badgesGrid}>
        {badges.map(b => (
          <div key={b.id} className={`${styles.badgePill} ${b.earned ? styles.badgeEarned : styles.badgeLocked}`} title={b.desc}>
            <span className={styles.badgeIcon}>{b.icon}</span>
            <span className={styles.badgeLabel}>{b.label}</span>
            {!b.earned && <span className={styles.badgeLock}>🔒</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── NEW: Dynamic Goal Engine ── */
const GoalEngineCard = ({ todayData, yesterdayData, waterCount, waterGoal, steps, stepGoal, sleepHours, sleepGoal }) => {
  const goals = [];

  const stepDiff = (yesterdayData?.steps || 0) - steps;
  if (stepDiff > 0) {
    goals.push({ icon: '👟', color: '#16a34a', bg: '#f0fdf4', text: `Walk ${stepDiff.toLocaleString()} more steps to beat yesterday` });
  } else if (steps < stepGoal) {
    goals.push({ icon: '👟', color: '#16a34a', bg: '#f0fdf4', text: `${(stepGoal - steps).toLocaleString()} steps left to hit your daily goal` });
  }

  const waterLeft = waterGoal - waterCount;
  if (waterLeft > 0) {
    goals.push({ icon: '💧', color: '#0369a1', bg: '#f0f9ff', text: `Drink ${waterLeft} more glasses for optimal hydration` });
  }

  const todayBurn = todayData?.burned || 0;
  const yesterBurn = yesterdayData?.burned || 0;
  if (yesterBurn > todayBurn && yesterBurn > 0) {
    const burnDiff = yesterBurn - todayBurn;
    goals.push({ icon: '🔥', color: '#ea580c', bg: '#fff7ed', text: `Burn ${burnDiff} more kcal to match yesterday's effort` });
  }

  const todayConsumed = todayData?.consumed || 0;
  if (todayConsumed < 1200) {
    goals.push({ icon: '🥗', color: '#7c3aed', bg: '#f5f3ff', text: `Log ${1200 - todayConsumed} more kcal to reach minimum intake` });
  }

  if (sleepHours < sleepGoal) {
    goals.push({ icon: '🌙', color: '#7c3aed', bg: '#f5f3ff', text: `Aim for ${sleepGoal - sleepHours}h more sleep tonight for full recovery` });
  }

  if (goals.length === 0) {
    goals.push({ icon: '🌟', color: '#16a34a', bg: '#f0fdf4', text: "You're crushing all your goals today! Keep it up!" });
  }

  return (
    <div className={`${styles.card} ${styles.goalEngineCard}`}>
      <div className={styles.cardHead}>
        <div className={styles.cardHeadIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h3 className={styles.cardTitle}>Today's Goal Engine</h3>
      </div>
      <div className={styles.goalList}>
        {goals.slice(0, 4).map((g, i) => (
          <div key={i} className={styles.goalItem} style={{ background: g.bg, borderLeft: `3px solid ${g.color}` }}>
            <span className={styles.goalItemIcon}>{g.icon}</span>
            <span className={styles.goalItemTxt} style={{ color: g.color }}>{g.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── NEW: Activity Feed Timeline ── */
const ActivityFeedCard = ({ weeklyCalories, waterCount, fitbitData }) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayData = weeklyCalories.find(d => d.date === todayStr);

  const feed = [];

  if (todayData?.consumed > 0) {
    feed.push({ icon: '🍽️', label: 'Meals logged today', val: `${todayData.consumed} kcal consumed`, color: '#16a34a', time: 'Today' });
  }
  if (todayData?.burned > 0) {
    feed.push({ icon: '🏃', label: 'Calories burned', val: `${todayData.burned} kcal from activity`, color: '#ea580c', time: 'Today' });
  }
  if (waterCount > 0) {
    feed.push({ icon: '💧', label: 'Hydration', val: `${waterCount} glasses of water`, color: '#0369a1', time: 'Today' });
  }
  if (fitbitData?.sleep) {
    feed.push({ icon: '🌙', label: 'Last night\'s sleep', val: fitbitData.sleep, color: '#7c3aed', time: 'Last night' });
  }
  if (fitbitData?.steps) {
    feed.push({ icon: '👟', label: 'Steps taken', val: `${parseInt(fitbitData.steps).toLocaleString()} steps`, color: '#16a34a', time: 'Today' });
  }

  if (feed.length === 0) {
    feed.push({ icon: '📝', label: 'No activity yet', val: 'Start logging to see your feed!', color: '#6b7280', time: 'Today' });
  }

  return (
    <div className={`${styles.card} ${styles.feedCard}`}>
      <div className={styles.cardHead}>
        <div className={styles.cardHeadIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </div>
        <h3 className={styles.cardTitle}>Activity Feed</h3>
      </div>
      <div className={styles.feedList}>
        {feed.map((item, i) => (
          <div key={i} className={styles.feedItem}>
            <div className={styles.feedDot} style={{ background: item.color }}/>
            <div className={styles.feedLine} style={{ background: i < feed.length - 1 ? '#e5e7eb' : 'transparent' }}/>
            <div className={styles.feedContent}>
              <div className={styles.feedIconWrap} style={{ background: `${item.color}18` }}>
                <span className={styles.feedIcon}>{item.icon}</span>
              </div>
              <div className={styles.feedText}>
                <span className={styles.feedLabel}>{item.label}</span>
                <span className={styles.feedVal}>{item.val}</span>
              </div>
              <span className={styles.feedTime}>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
═══════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fitbitData, setFitbitData] = useState(null);
  const [waterCount, setWaterCount] = useState(0);
  const [weeklyCalories, setWeeklyCalories] = useState([]);
  const [moodData, setMoodData] = useState([]);

  const [streaks, setStreaks] = useState({
    calories: 0,
    steps: 0,
    water: 0,
    sleep: 0,
    messages: []
  });

  useEffect(() => {
    let unsubscribeDoc = null;
    let stepInterval = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const uid = user.uid;
      const userRef = doc(db, "users", uid);

      const cached = localStorage.getItem("fitbitData");
      if (cached) {
        const parsed = JSON.parse(cached);
        setFitbitData(parsed);
        setWaterCount(parseInt(parsed.water) || 0);
      }

      // Fetch mood data for Smart Insights
      const fetchMoodData = async () => {
        try {
          const moodSnap = await getDocs(collection(db, "users", uid, "mood_cravings"));
          const moods = [];
          moodSnap.forEach(doc => moods.push(doc.data()));
          setMoodData(moods);
        } catch (err) {
          console.error("Mood data fetch failed", err);
        }
      };

      const fetchWeeklyCalories = async () => {
        try {
          const today = new Date();
          const currentDay = today.getDay();
          const diff = currentDay === 0 ? -6 : 1 - currentDay;
          const monday = new Date(today);
          monday.setDate(today.getDate() + diff);

          const last7Days = [];
          for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const formatted = d.toISOString().split("T")[0];
            last7Days.push({
              date: formatted,
              day: d.toLocaleDateString("en-US", { weekday: "short" })
            });
          }

          const mealsSnap = await getDocs(collection(db, "users", uid, "loggedMeals"));
          const exerciseSnap = await getDocs(collection(db, "users", uid, "loggedExercises"));
          const fitbitSnap = await getDocs(collection(db, "users", uid, "fitbit_data"));

          const map = {};
          last7Days.forEach(d => {
            map[d.date] = { date: d.date, day: d.day, consumed: 0, burned: 0, steps: 0, water: 0, sleep: 0 };
          });

          mealsSnap.forEach(doc => {
            const data = doc.data();
            if (!data.date || !data.calories) return;
            if (map[data.date]) map[data.date].consumed += Number(data.calories);
          });

          exerciseSnap.forEach(doc => {
            const data = doc.data();
            if (!data.date || !data.calories) return;
            if (map[data.date]) map[data.date].burned += Number(data.calories);
          });

          fitbitSnap.forEach(doc => {
            const data = doc.data();
            const date = doc.id;
            if (map[date]) {
              if (data.steps) {
                map[date].steps = Number(data.steps);
                map[date].burned += Math.round(Number(data.steps) * 0.04);
              }
              if (data.water) {
                const waterNum = parseInt(data.water.toString().replace(/\D/g, ""));
                map[date].water = waterNum || 0;
              }
              let hrs = 0;
              if (data.sleep) {
                const match = data.sleep.match(/\d+/);
                hrs = match ? parseInt(match[0]) : 0;
              }
              map[date].sleep = hrs;
            }
          });

          const result = last7Days.map(d => map[d.date]);
          calculateStreaks(map);
          setWeeklyCalories(result);
        } catch (err) {
          console.error("Firestore calorie fetch failed", err);
        }
      };

      const calculateStreaks = (dataMap) => {
        const todayStr = new Date().toISOString().split("T")[0];
        const allDays = Object.values(dataMap).sort((a, b) => new Date(b.date) - new Date(a.date));
        const today = allDays.find(d => d.date === todayStr);
        const pastDays = allDays.filter(d => d.date !== todayStr);

        const getStreak = (days, condition) => {
          let streak = 0;
          for (let d of days) {
            if (condition(d)) streak++;
            else break;
          }
          return streak;
        };

        const calStreak = getStreak(pastDays, d => d.consumed >= 1000 && d.burned >= 500);
        const stepStreak = getStreak(pastDays, d => (d.steps || 0) >= 10000);
        const waterStreak = getStreak(pastDays, d => (d.water || 0) >= 12);
        const sleepStreak = getStreak(pastDays, d => (d.sleep || 0) >= 8);

        let messages = [];
        if (today) {
          const calLeft = Math.max(0, 1000 - (today.consumed || 0));
          const burnLeft = Math.max(0, 500 - (today.burned || 0));
          const stepsLeft = Math.max(0, 10000 - (today.steps || 0));
          const waterLeft = Math.max(0, 12 - (today.water || 0));
          const sleepLeft = Math.max(0, 8 - (today.sleep || 0));

          if (calLeft > 0 || burnLeft > 0) messages.push(`🔥 ${calLeft} kcal intake & ${burnLeft} burn needed`);
          if (stepsLeft > 0) messages.push(`👟 ${stepsLeft} steps needed to maintain streak`);
          if (waterLeft > 0) messages.push(`💧 ${waterLeft} glasses needed to maintain streak`);
          if (sleepLeft > 0) messages.push(`🌙 ${sleepLeft} hrs sleep needed to maintain streak`);
        }

        const finalStreaks = {
          calories: calStreak + (today?.consumed >= 1000 && today?.burned >= 500 ? 1 : 0),
          steps: stepStreak + ((today?.steps || 0) >= 10000 ? 1 : 0),
          water: waterStreak + ((today?.water || 0) >= 12 ? 1 : 0),
          sleep: sleepStreak + ((today?.sleep || 0) >= 8 ? 1 : 0),
          messages
        };

        setStreaks(finalStreaks);
      };

      const fetchData = () => {
        fetch(`http://localhost:5000/fitbit/data/${uid}`)
          .then(res => res.json())
          .then(data => {
            setFitbitData(data);
            const glasses = parseInt(data.water) || 0;
            setWaterCount(glasses);
            localStorage.setItem("fitbitData", JSON.stringify(data));
          })
          .catch(err => console.error("Fitbit data fetch failed", err));

        fetchWeeklyCalories();
        fetchMoodData();
      };

      fetchData();
      stepInterval = setInterval(fetchData, 120000);

      unsubscribeDoc = onSnapshot(userRef, (snap) => {
        if (!snap.exists()) {
          setError("User profile not found");
          setLoading(false);
          return;
        }
        setUserData(snap.data());
        setLoading(false);
      });
    });

    return () => {
      if (unsubscribeDoc) unsubscribeDoc();
      if (stepInterval) clearInterval(stepInterval);
      unsubscribeAuth();
    };
  }, [navigate]);

  const updateWater = (value) => {
    const user = auth.currentUser;
    setWaterCount(value);
    const cached = JSON.parse(localStorage.getItem("fitbitData") || "{}");
    cached.water = `${value} glasses`;
    localStorage.setItem("fitbitData", JSON.stringify(cached));
    fetch("http://localhost:5000/water/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, water: value })
    });
  };

  if (loading) return (
    <div className={styles.loaderScreen}>
      <div className={styles.loaderRing}>
        <svg viewBox="0 0 80 80" width="80" height="80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#dcfce7" strokeWidth="8"/>
          <circle cx="40" cy="40" r="32" fill="none" stroke="url(#lg)" strokeWidth="8"
            strokeLinecap="round" strokeDasharray="80 120" className={styles.loaderArc}/>
          <defs>
            <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e"/>
              <stop offset="100%" stopColor="#4ade80"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <p className={styles.loaderText}>Loading your health dashboard…</p>
    </div>
  );
  if (error) return <div className={styles.errorScreen}>{error}</div>;
  if (!userData) return <div className={styles.errorScreen}>No data available</div>;

  /* ── Derived values (ALL SAME logic as original) ── */
  const { basicProfile, healthProfile, goal, preferences, mlResult } = userData;

  const stepGoal = 10000;
  const steps = parseInt(fitbitData?.steps) || 0;
  const stepPercent = Math.min((steps / stepGoal) * 100, 100);

  const waterGoal = 12;
  const waterPercent = Math.min((waterCount / waterGoal) * 100, 100);

  const sleepParts = fitbitData?.sleep?.split("h") || [];
  const sleepHours = parseInt(sleepParts[0]) || 0;
  const sleepGoal = 8;
  const sleepPercent = Math.min((sleepHours / sleepGoal) * 100, 100);

  const totalConsumed = weeklyCalories.reduce((sum, day) => sum + (day.consumed || 0), 0);
  const totalBurned = weeklyCalories.reduce((sum, day) => sum + (day.burned || 0), 0);
  const netCalories = totalConsumed - totalBurned;
  const avgConsumed = Math.round(totalConsumed / 7);
  const avgBurned = Math.round(totalBurned / 7);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayData = weeklyCalories.find(d => d.date === todayStr);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yStr = yesterdayDate.toISOString().split("T")[0];
  const yesterdayData = weeklyCalories.find(d => d.date === yStr);

  let calorieStatus = "";
  if (netCalories > 200) calorieStatus = "You are in a calorie surplus ⚠️";
  else if (netCalories < -200) calorieStatus = "You are in a calorie deficit 🔥";
  else calorieStatus = "You are maintaining your calories ✅";

  let goalMessage = "";
  if (goal === "Weight Loss") goalMessage = netCalories < 0 ? "Good job! You're aligned with fat loss goal 💪" : "Try to stay in deficit for fat loss ⚠️";
  else if (goal === "Muscle Gain") goalMessage = netCalories > 0 ? "Great! Surplus supports muscle gain 💪" : "Increase calories for muscle gain ⚠️";
  else goalMessage = "You're maintaining your current lifestyle 👍";

  const lastWeekCalories = totalConsumed - 500;
  const trendDiff = totalConsumed - lastWeekCalories;
  let trendMessage = "";
  if (trendDiff > 0) trendMessage = `↑ ${trendDiff} kcal more than last week`;
  else if (trendDiff < 0) trendMessage = `↓ ${Math.abs(trendDiff)} kcal less than last week`;
  else trendMessage = "No change from last week";

  const weightChangeKg = (netCalories / 7700).toFixed(2);
  let weightPrediction = "";
  if (weightChangeKg > 0) weightPrediction = `You may gain ~${weightChangeKg} kg this week`;
  else if (weightChangeKg < 0) weightPrediction = `You may lose ~${Math.abs(weightChangeKg)} kg this week`;
  else weightPrediction = "Your weight is likely to remain stable";

  let insights = [];
  if (avgConsumed > avgBurned + 300) insights.push("Your calorie intake is consistently high");
  if (avgBurned < 300) insights.push("Your activity level is low");
  if (weeklyCalories.filter(d => d.consumed > d.burned).length >= 5) insights.push("You are in surplus most days this week");
  if (weeklyCalories.filter(d => d.burned > d.consumed).length >= 5) insights.push("Great consistency in calorie deficit");

  let aiSuggestion = "";
  if (goal === "Weight Loss") {
    aiSuggestion = netCalories > 0 ? "Reduce ~300 kcal daily or add 30 min cardio to enter fat-loss zone" : "You're doing well. Maintain this deficit for steady fat loss";
  } else if (goal === "Muscle Gain") {
    aiSuggestion = netCalories < 0 ? "Increase daily intake by ~300 kcal with high-protein foods" : "Good surplus. Ensure protein intake for lean muscle gain";
  } else {
    aiSuggestion = "Maintain balanced intake and activity for optimal health";
  }

  const dailyDiffs = weeklyCalories.map(d => Math.abs((d.consumed || 0) - (d.burned || 0)));
  const avgDiff = dailyDiffs.reduce((a, b) => a + b, 0) / dailyDiffs.length;
  let consistencyScore = Math.round(Math.max(0, 100 - avgDiff / 10));

  const avgDailyBurn = totalBurned / 7;
  let activityScore = Math.round(Math.min(100, (avgDailyBurn / 2200) * 100));

  let dietScore = 0;
  if (goal === "Weight Loss") dietScore = netCalories < 0 ? 90 : 40;
  else if (goal === "Muscle Gain") dietScore = netCalories > 0 ? 90 : 40;
  else dietScore = 75;
  if (Math.abs(netCalories) < 300) dietScore += 5;
  dietScore = Math.min(100, dietScore);

  const weeklyScore = Math.round((consistencyScore * 0.4) + (activityScore * 0.3) + (dietScore * 0.3));

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      <Header title="Dashboard" userName={basicProfile?.name} navigate={navigate} />
      <div className={styles.container}>
        <BgMesh />
        <LeafSprig />

        <main className={styles.main}>

          {/* ══ BANNER ROW ══ */}
          <div className={styles.bannerRow}>
            <div className={styles.greetBlock}>
              <div className={styles.livePill}>
                <span className={styles.liveDot}/>
                Live tracking active
              </div>
              <h1 className={styles.greetTitle}>
                Hey, <span className={styles.greetName}>{basicProfile?.name}</span> 🌿
              </h1>
              <p className={styles.greetSub}>Your personalized health insights for today.</p>
            </div>

            <div className={styles.bannerRight}>
              <div className={styles.profileChips}>
                <span className={styles.chip} data-color="green">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                  {goal}
                </span>
                <span className={styles.chip} data-color="orange">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                  </svg>
                  {healthProfile?.diet}
                </span>
                <span className={styles.chip} data-color="sky">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  {preferences?.activity}
                </span>
                <span className={styles.chip} data-color="indigo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  BMI {mlResult?.bmi}
                </span>
              </div>
              <button className={styles.fitbitBtn} onClick={connectFitbit}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Connect Fitbit
              </button>
            </div>
          </div>

          {/* ══ THREE-COLUMN MAIN GRID ══ */}
          <div className={styles.triGrid}>

            {/* ─── COL A: Daily Activity Trackers ─── */}
            <div className={styles.colA}>

              {/* Steps card */}
              <div className={`${styles.card} ${styles.cardPrimary} ${styles.stepsCard}`}>
                <div className={styles.cardHead}>
                  <div className={styles.cardHeadIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 4c-1.1 0-2 .9-2 2v4.5L8.5 9c-.8-.5-1.8-.2-2.2.6l-.1.2c-.4.8-.1 1.8.7 2.2l4.1 2.4V18c0 1.1.9 2 2 2s2-.9 2-2v-5.6c0-.6-.3-1.2-.8-1.6L12 9.5V6c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </div>
                  <h3 className={styles.cardTitle}>Steps Today</h3>
                  <span className={styles.cardBadge} style={{ background: '#dcfce7', color: '#15803d' }}>
                    {Math.round(stepPercent)}%
                  </span>
                </div>
                <div className={styles.stepsBody}>
                  <RingGauge percent={stepPercent} value={steps.toLocaleString()} sub={`of ${stepGoal.toLocaleString()}`}
                    color1="#22c55e" color2="#4ade80" size={120}/>
                  <div className={styles.stepsStats}>
                    <div className={styles.miniStat}>
                      <span className={styles.miniStatVal} style={{ color: '#16a34a' }}>{steps.toLocaleString()}</span>
                      <span className={styles.miniStatLbl}>taken</span>
                    </div>
                    <div className={styles.miniStatDiv}/>
                    <div className={styles.miniStat}>
                      <span className={styles.miniStatVal} style={{ color: '#6b7280' }}>{(stepGoal - steps > 0 ? stepGoal - steps : 0).toLocaleString()}</span>
                      <span className={styles.miniStatLbl}>remaining</span>
                    </div>
                  </div>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${stepPercent}%`, background: 'linear-gradient(90deg,#22c55e,#4ade80)' }}/>
                </div>
              </div>

              {/* Sleep + Water side-by-side */}
              <div className={styles.twoUp}>
                <div className={`${styles.card} ${styles.sleepCard}`}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardHeadIcon} style={{ background: '#ede9fe', color: '#7c3aed' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                      </svg>
                    </div>
                    <h3 className={styles.cardTitle}>Sleep</h3>
                  </div>
                  <div className={styles.sleepCenter}>
                    <span className={styles.sleepBig}>{fitbitData?.sleep || "—"}</span>
                    <span className={styles.sleepGoalLbl}>Goal: {sleepGoal}h</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${sleepPercent}%`, background: 'linear-gradient(90deg,#8b5cf6,#a78bfa)' }}/>
                  </div>
                  <p className={styles.trackerSub}>{sleepHours}/{sleepGoal} hrs · {Math.round(sleepPercent)}%</p>
                </div>

                <div className={`${styles.card} ${styles.waterCard}`}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardHeadIcon} style={{ background: '#e0f2fe', color: '#0369a1' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                      </svg>
                    </div>
                    <h3 className={styles.cardTitle}>Water</h3>
                  </div>
                  <div className={styles.waterBody}>
                    <WaterTank percent={waterPercent}/>
                    <div className={styles.waterCtrl}>
                      <button className={styles.wBtn} onClick={() => waterCount > 0 && updateWater(waterCount - 1)}>−</button>
                      <div className={styles.wCountBox}>
                        <span className={styles.wNum}>{waterCount}</span>
                        <span className={styles.wUnit}>/ {waterGoal}</span>
                      </div>
                      <button className={styles.wBtn} onClick={() => updateWater(waterCount + 1)}>+</button>
                    </div>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${waterPercent}%`, background: 'linear-gradient(90deg,#38bdf8,#0ea5e9)' }}/>
                  </div>
                  <p className={styles.trackerSub}>{waterCount}/{waterGoal} glasses</p>
                </div>
              </div>

              {/* Streaks */}
              <div className={`${styles.card} ${styles.streaksCard}`}>
                <div className={styles.cardHead}>
                  <div className={styles.cardHeadIcon} style={{ background: '#fff7ed', color: '#ea580c' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                    </svg>
                  </div>
                  <h3 className={styles.cardTitle}>Streaks</h3>
                </div>
                <div className={styles.streakRow}>
                  {[
                    { icon: '🔥', label: 'Calories', val: streaks.calories, bg: '#fff7ed', accent: '#ea580c' },
                    { icon: '👟', label: 'Steps', val: streaks.steps, bg: '#f0fdf4', accent: '#16a34a' },
                    { icon: '💧', label: 'Water', val: streaks.water, bg: '#f0f9ff', accent: '#0369a1' },
                    { icon: '🌙', label: 'Sleep', val: streaks.sleep, bg: '#f5f3ff', accent: '#7c3aed' },
                  ].map(s => (
                    <div key={s.label} className={styles.streakPill} style={{ background: s.bg }}>
                      <span className={styles.streakEmoji}>{s.icon}</span>
                      <span className={styles.streakNum} style={{ color: s.accent }}>{s.val}</span>
                      <span className={styles.streakLbl}>{s.label}</span>
                      <span className={styles.streakDays}>days</span>
                    </div>
                  ))}
                </div>
                {streaks.messages?.length > 0 && (
                  <div className={styles.streakAlerts}>
                    <p className={styles.streakAlertsTitle}>Today's targets to keep streak alive</p>
                    {streaks.messages.map((msg, i) => (
                      <div key={i} className={styles.streakAlertRow}>
                        <span className={styles.streakAlertDot}/>
                        {msg}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* NEW: Daily Nutrition Report Card */}
              <NutritionReportCard
                todayData={todayData}
                waterCount={waterCount}
                waterGoal={waterGoal}
                sleepHours={sleepHours}
                sleepGoal={sleepGoal}
                steps={steps}
                stepGoal={stepGoal}
              />

            </div>

            {/* ─── COL B: Charts & Summary (center) ─── */}
            <div className={styles.colB}>

              {/* Calorie chart */}
              <div className={`${styles.card} ${styles.cardPrimary} ${styles.chartCard}`}>
                <div className={styles.cardHead}>
                  <div className={styles.cardHeadIcon} style={{ background: '#dcfce7', color: '#15803d' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </div>
                  <h3 className={styles.cardTitle}>Weekly Calorie Balance</h3>
                </div>
                <div className={styles.chartArea}>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={weeklyCalories} barGap={4} barCategoryGap="28%">
                      <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'Nunito, sans-serif' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip />}/>
                      <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Nunito, sans-serif', paddingTop: '8px' }}/>
                      <Bar dataKey="consumed" name="Consumed" fill="#4ade80" radius={[6, 6, 0, 0]}/>
                      <Bar dataKey="burned" name="Burned" fill="#f97316" radius={[6, 6, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Today vs Yesterday */}
              <div className={`${styles.card} ${styles.compareCard}`}>
                <div className={styles.cardHead}>
                  <div className={styles.cardHeadIcon} style={{ background: '#fff7ed', color: '#ea580c' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                    </svg>
                  </div>
                  <h3 className={styles.cardTitle}>Today vs Yesterday</h3>
                </div>
                <div className={styles.compareGrid}>
                  {[
                    { label: "Yesterday", data: yesterdayData, accent: '#6b7280' },
                    { label: "Today", data: todayData, accent: '#16a34a' }
                  ].map(({ label, data: d, accent }) => (
                    <div key={label} className={styles.comparePanel}>
                      <div className={styles.comparePanelLabel} style={{ color: accent }}>{label}</div>
                      <div className={styles.compareMetric}>
                        <span className={styles.compareMetricIcon}>🍽</span>
                        <div className={styles.compareMetricInfo}>
                          <div className={styles.compareMetricTop}>
                            <span>Intake</span>
                            <span className={styles.compareMetricVal}>{d?.consumed || 0} kcal</span>
                          </div>
                          <div className={styles.miniTrack}>
                            <div style={{ width: `${Math.min((d?.consumed || 0) / 2000 * 100, 100)}%`, background: 'linear-gradient(90deg,#4ade80,#22c55e)' }}/>
                          </div>
                        </div>
                      </div>
                      <div className={styles.compareMetric}>
                        <span className={styles.compareMetricIcon}>🔥</span>
                        <div className={styles.compareMetricInfo}>
                          <div className={styles.compareMetricTop}>
                            <span>Burned</span>
                            <span className={styles.compareMetricVal}>{d?.burned || 0} kcal</span>
                          </div>
                          <div className={styles.miniTrack}>
                            <div style={{ width: `${Math.min((d?.burned || 0) / 2000 * 100, 100)}%`, background: 'linear-gradient(90deg,#f97316,#ef4444)' }}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly summary */}
              <div className={`${styles.card} ${styles.summaryCard}`}>
                <div className={styles.cardHead}>
                  <div className={styles.cardHeadIcon} style={{ background: '#dcfce7', color: '#15803d' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                    </svg>
                  </div>
                  <h3 className={styles.cardTitle}>Weekly Summary</h3>
                </div>
                <div className={styles.statusBanner}>{calorieStatus}</div>
                <div className={styles.statusSubs}>
                  <span className={styles.statusMsg}>{goalMessage}</span>
                  <span className={styles.statusTrend}>{trendMessage}</span>
                </div>
                <div className={styles.summaryFive}>
                  {[
                    { emoji: '🍽️', label: 'Total Consumed', val: totalConsumed, unit: 'kcal' },
                    { emoji: '🔥', label: 'Total Burned', val: totalBurned, unit: 'kcal' },
                    { emoji: '⚖️', label: 'Net Balance', val: netCalories, unit: 'kcal', color: netCalories > 0 ? '#ef4444' : '#22c55e' },
                    { emoji: '🎯', label: 'Avg Intake', val: avgConsumed, unit: 'kcal' },
                    { emoji: '💓', label: 'Avg Burn', val: avgBurned, unit: 'kcal' },
                  ].map((item, i) => (
                    <div key={i} className={styles.sumItem}>
                      <span className={styles.sumEmoji}>{item.emoji}</span>
                      <span className={styles.sumLbl}>{item.label}</span>
                      <span className={styles.sumVal} style={item.color ? { color: item.color } : {}}>{item.val}</span>
                      <span className={styles.sumUnit}>{item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* NEW: Goal Engine */}
              <GoalEngineCard
                todayData={todayData}
                yesterdayData={yesterdayData}
                waterCount={waterCount}
                waterGoal={waterGoal}
                steps={steps}
                stepGoal={stepGoal}
                sleepHours={sleepHours}
                sleepGoal={sleepGoal}
              />

              {/* NEW: Activity Feed */}
              <ActivityFeedCard
                weeklyCalories={weeklyCalories}
                waterCount={waterCount}
                fitbitData={fitbitData}
              />

            </div>

            {/* ─── COL C: Score, Insights, AI ─── */}
            <div className={styles.colC}>

              {/* Health Score */}
              <div className={`${styles.card} ${styles.cardPrimary} ${styles.scoreCard}`}>
                <div className={styles.cardHead}>
                  <div className={styles.cardHeadIcon} style={{ background: '#fff7ed', color: '#ea580c' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className={styles.cardTitle}>Weekly Health Score</h3>
                </div>
                <div className={styles.scoreBody}>
                  <ScoreRing score={weeklyScore}/>
                  <div className={styles.scoreBars}>
                    {[
                      { label: 'Consistency', val: consistencyScore, grad: 'linear-gradient(90deg,#22c55e,#16a34a)' },
                      { label: 'Activity', val: activityScore, grad: 'linear-gradient(90deg,#f97316,#ea580c)' },
                      { label: 'Diet Balance', val: dietScore, grad: 'linear-gradient(90deg,#38bdf8,#0ea5e9)' },
                    ].map(b => (
                      <div key={b.label} className={styles.scoreBarRow}>
                        <span className={styles.scoreBarLabel}>{b.label}</span>
                        <div className={styles.scoreBarTrack}>
                          <div style={{ width: `${b.val}%`, background: b.grad }} className={styles.scoreBarFill}/>
                        </div>
                        <span className={styles.scoreBarNum}>{b.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weight Prediction */}
              <div className={`${styles.card} ${styles.weightCard}`}>
                <div className={styles.weightInner}>
                  <div className={styles.weightIconCircle}>⚖️</div>
                  <div>
                    <p className={styles.weightCardLbl}>Weight Prediction</p>
                    <p className={styles.weightCardTxt}>{weightPrediction}</p>
                  </div>
                </div>
              </div>

              {/* Insights */}
              {insights.length > 0 && (
                <div className={`${styles.card} ${styles.insightCard}`}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardHeadIcon} style={{ background: '#fefce8', color: '#ca8a04' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <h3 className={styles.cardTitle}>Insights</h3>
                  </div>
                  {insights.map((insight, idx) => (
                    <div key={idx} className={styles.insightRow}>
                      <span className={styles.insightDot}/>
                      <span className={styles.insightTxt}>{insight}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* NEW: Smart AI Insights */}
              <SmartInsightsCard weeklyCalories={weeklyCalories} moodData={moodData} />

              {/* NEW: Badges */}
              <BadgesCard
                streaks={streaks}
                weeklyCalories={weeklyCalories}
                waterCount={waterCount}
                waterGoal={waterGoal}
              />

              {/* AI Suggestion */}
              <div className={styles.aiCard}>
                <div className={styles.aiTopRow}>
                  <span className={styles.aiPulse}/>
                  <span className={styles.aiTag}>AI Suggestion</span>
                </div>
                <p className={styles.aiText}>{aiSuggestion}</p>
                <div className={styles.aiLeaf}>🌿</div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;