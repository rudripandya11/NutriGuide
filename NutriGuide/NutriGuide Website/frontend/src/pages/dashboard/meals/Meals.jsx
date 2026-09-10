import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../../../firebase";
import { generateMealPlan } from "../../../services/mealPlanService";
import Header from "../../../components/navigation/Header";

import styles from "./Meals.module.css";

/* ─── SVG Decorations aligned with logo palette ─── */

/* Leaf icon drawn from logo's organic green leaf motif */
const LeafIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={styles.leafIcon}>
    <path
      d="M12 2C6 2 3 7 3 12c0 4 2.5 7.5 6 9l1-4c-2-1.5-3-4-3-5 0-3 2-6 5-7v3l5-5-5-5v3C7.5 2.5 9.5 2 12 2z"
      fill="url(#leafGrad)"
    />
    <path d="M12 22c5.5-1 9-5.5 9-10 0-4-2-7-5-9" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <defs>
      <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4ade80"/>
        <stop offset="100%" stopColor="#15803d"/>
      </linearGradient>
    </defs>
  </svg>
);

/* Fork icon echoing the logo's fork silhouette */
const ForkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.forkIcon}>
    <path d="M6 2v6c0 1.1.9 2 2 2h0v12" stroke="url(#forkGrad)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 2v6c0 1.1-.9 2-2 2" stroke="url(#forkGrad)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 10v12" stroke="url(#forkGrad)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 2c0 0 2 2 2 5s-2 3-2 3v12" stroke="url(#forkGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="forkGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22c55e"/>
        <stop offset="100%" stopColor="#15803d"/>
      </linearGradient>
    </defs>
  </svg>
);

/* Dumbbell icon from logo's fitness motif */
const DumbbellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="10" width="4" height="4" rx="1.5" fill="#22c55e"/>
    <rect x="18" y="10" width="4" height="4" rx="1.5" fill="#22c55e"/>
    <rect x="5" y="8" width="3" height="8" rx="1" fill="#15803d"/>
    <rect x="16" y="8" width="3" height="8" rx="1" fill="#15803d"/>
    <rect x="8" y="11" width="8" height="2" rx="1" fill="#4ade80"/>
  </svg>
);

/* Sparkle star — from logo's glint dots */
const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="url(#sparkleGrad)"/>
    <defs>
      <linearGradient id="sparkleGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#f59e0b"/>
      </linearGradient>
    </defs>
  </svg>
);

/* Fruit/orange icon — from logo's orange fruit */
const FruitIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="14" r="8" fill="url(#fruitGrad)"/>
    <path d="M12 6c0 0-1-4 2-4" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M14 5c1-2 3-1 3-1" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <defs>
      <linearGradient id="fruitGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#f97316"/>
      </linearGradient>
    </defs>
  </svg>
);

/* Refresh / cycle icon */
const RefreshIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 12a8 8 0 0114.93-4H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 12a8 8 0 01-14.93 4H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="15,4 19,8 15,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="9,12 5,16 9,20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* Check icon for logged state */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* Meal-type icon mapping — organic feel from logo */
const MealIcon = ({ type }) => {
  const t = (type || "").toLowerCase();

  if (t.includes("break")) {
    return <span style={{ fontSize: "24px" }}>🍳</span>;
  }

  if (t.includes("lunch")) {
    return <span style={{ fontSize: "24px" }}>🍽️</span>;
  }

  if (t.includes("dinner")) {
    return <span style={{ fontSize: "24px" }}>🍲</span>;
  }

  if (t.includes("snack")) {
    return <span style={{ fontSize: "24px" }}>🍎</span>;
  }

  return <span style={{ fontSize: "24px" }}>🍽️</span>;
};

/* Background SVG blob decoration — organic shape like logo heart */
const BgBlob = () => (
  <svg className={styles.bgBlob} viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(300,300)">
      <path d="M120,-157C152,-134,172,-94,178,-53C184,-12,175,30,155,66C135,102,104,131,68,148C32,165,-9,170,-50,162C-91,154,-132,133,-158,100C-184,67,-194,22,-185,-19C-176,-60,-149,-97,-116,-124C-83,-151,-44,-168,0,-168C44,-168,88,-185,120,-157Z"
        fill="url(#blobGrad)" opacity="0.07"/>
    </g>
    <defs>
      <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#22c55e"/>
        <stop offset="100%" stopColor="#4ade80"/>
      </linearGradient>
    </defs>
  </svg>
);

/* Decorative dots pattern — echoes logo's dot ring */
const DotPattern = () => (
  <svg className={styles.dotPattern} width="120" height="120" viewBox="0 0 120 120">
    {[...Array(6)].map((_, row) =>
      [...Array(6)].map((_, col) => (
        <circle
          key={`${row}-${col}`}
          cx={col * 20 + 10}
          cy={row * 20 + 10}
          r="2.5"
          fill="#22c55e"
          opacity={0.15 + (row + col) * 0.03}
        />
      ))
    )}
  </svg>
);

/* ─── Main Component ─── */
const Meals = () => {
  const navigate = useNavigate();

  /* ── All original state preserved exactly ── */
  const [userData, setUserData] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedMeals, setLoggedMeals] = useState({});

  const [nutrition, setNutrition] = useState({
    totalCalories: 0,
    targetCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    proteinTarget: 0,
    carbsTarget: 0,
    fatsTarget: 0
  });

  const today = new Date().toISOString().split("T")[0];

  // =============================
  // LOAD USER + PLAN — unchanged
  // =============================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return navigate("/login");

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      const data = snap.data();
      setUserData(data);

      const payload = buildPayload(data);
      const result = await generateMealPlan(payload);
      
      setMealPlan(result.meal_plan);

      await loadLoggedMeals(user.uid);
      await calculateNutrition(data, user.uid);

      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);

  // =============================
  // BUILD PAYLOAD — unchanged
  // =============================
  const buildPayload = (data) => ({
    age: data.basicProfile.age,
    gender: data.basicProfile.gender,
    height: data.basicProfile.height,
    weight: data.basicProfile.weight,
    activity_level: data.preferences.activity,
    goal: data.goal,
    diet_preference: data.healthProfile.diet,
    budget: data.preferences.budget
  });

  // =============================
  // LOAD LOGGED MEALS — unchanged
  // =============================
  const loadLoggedMeals = async (uid) => {
    const q = query(
      collection(db, "users", uid, "loggedMeals"),
      where("date", "==", today)
    );

    const snap = await getDocs(q);

    const map = {};
    snap.forEach(doc => {
      map[doc.data().name] = true;
    });

    setLoggedMeals(map);
  };

  // =============================
  // CALCULATE NUTRITION — unchanged
  // =============================
  const calculateNutrition = async (data, uid) => {
    const tdee = data.mlResult?.tdee || 2000;
    const goal = data.goal || "maintain";

    let targetCalories = tdee;

    if (goal === "lose") targetCalories -= 500;
    if (goal === "gain") targetCalories += 500;

    const proteinTarget = (0.30 * targetCalories) / 4;
    const carbsTarget = (0.40 * targetCalories) / 4;
    const fatsTarget = (0.30 * targetCalories) / 9;

    const q = query(
      collection(db, "users", uid, "loggedMeals"),
      where("date", "==", today)
    );

    const snap = await getDocs(q);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    snap.forEach(doc => {
      const d = doc.data();
      totalCalories += Number(d.calories || 0);
      totalProtein += Number(d.protein || 0);
      totalCarbs += Number(d.carbs || 0);
      totalFats += Number(d.fats || 0);
    });

    setNutrition({
      totalCalories,
      targetCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      proteinTarget,
      carbsTarget,
      fatsTarget
    });
  };

  // =============================
  // LOG MEAL — unchanged
  // =============================
  const logMeal = async (mealType, food) => {
    const uid = auth.currentUser.uid;

    await addDoc(collection(db, "users", uid, "loggedMeals"), {
      mealType,
      name: food.name,
      calories: food.calories,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fats: food.fats || 0,
      date: today,
      loggedAt: serverTimestamp()
    });

    setLoggedMeals(prev => ({ ...prev, [food.name]: true }));

    setTimeout(() => {
      calculateNutrition(userData, uid);
    }, 400);
  };

  // =============================
  // REFRESH ALL — unchanged
  // =============================
  const refreshAll = async () => {
    const result = await generateMealPlan(buildPayload(userData));
    setMealPlan(result.meal_plan);
  };

  // =============================
  // REFRESH SINGLE MEAL — unchanged
  // =============================
  const refreshMeal = async (mealType) => {
    const result = await generateMealPlan(buildPayload(userData));
    setMealPlan(prev => ({
      ...prev,
      [mealType]: result.meal_plan[mealType]
    }));
  };

  /* ── Enhanced loading screen — keeps logo palette ── */
  if (loading) return (
    <div className={styles.loadingScreen}>
      {/* Animated heart pulse matching logo */}
      <svg width="90" height="90" viewBox="0 0 90 90" className={styles.loadingHeart}>
        <defs>
          <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ade80"/>
            <stop offset="60%" stopColor="#22c55e"/>
            <stop offset="100%" stopColor="#15803d"/>
          </linearGradient>
        </defs>
        <path
          d="M45 75 C45 75 10 50 10 28 C10 16 20 8 30 8 C37 8 43 12 45 17 C47 12 53 8 60 8 C70 8 80 16 80 28 C80 50 45 75 45 75Z"
          fill="url(#heartGrad)"
        />
        {/* Fork overlay inside heart */}
        <path d="M35 28v8m0 6v12M33 28v6M37 28v6" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
        {/* Dumbbell overlay */}
        <path d="M50 42h14M54 38v8M60 38v8" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
      </svg>
      <p className={styles.loadingText}>Crafting your perfect meal plan…</p>
      <div className={styles.loadingDots}>
        <span/><span/><span/>
      </div>
    </div>
  );

  const caloriePercent = Math.min(
    (nutrition.totalCalories / nutrition.targetCalories) * 100,
    100
  );

  /* Macro color palette — drawn from logo (green + amber + teal) */
  const macroConfig = [
    {
      name: "Protein",
      total: nutrition.totalProtein,
      target: nutrition.proteinTarget,
      color: "#22c55e",       /* logo primary green */
      icon: <DumbbellIcon />,
      bg: "#f0fdf4"
    },
    {
      name: "Carbs",
      total: nutrition.totalCarbs,
      target: nutrition.carbsTarget,
      color: "#f59e0b",       /* logo amber/orange from fruit */
      icon: <FruitIcon />,
      bg: "#fffbeb"
    },
    {
      name: "Fats",
      total: nutrition.totalFats,
      target: nutrition.fatsTarget,
      color: "#14b8a6",       /* teal — logo's meditation glow */
      icon: <LeafIcon />,
      bg: "#f0fdfa"
    }
  ];

  return (
    <>
      <Header userName={userData?.basicProfile?.name} />

      {/* Page wrapper — light airy gradient from logo whites */}
      <div className={styles.container}>

        {/* Organic background decorations */}
        <BgBlob />
        <DotPattern />

        {/* ── TOP BAR with logo-heart badge ── */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            {/* Mini logo-echo heart badge */}
            <div className={styles.heartBadge}>
              <svg width="32" height="32" viewBox="0 0 32 32">
                <defs>
                  <linearGradient id="hbGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4ade80"/>
                    <stop offset="100%" stopColor="#15803d"/>
                  </linearGradient>
                </defs>
                <path d="M16 27C16 27 4 19 4 10.5C4 6.5 7 4 10 4C12.5 4 14.5 5.5 16 7C17.5 5.5 19.5 4 22 4C25 4 28 6.5 28 10.5C28 19 16 27 16 27Z"
                  fill="url(#hbGrad)"/>
                <path d="M10 11v5M8 13h4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M19 14h5M22 11v5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className={styles.pageTitle}>Today's Meal Plan</h2>
              {/* Live date tag */}
              <p className={styles.dateTag}>
                <SparkleIcon />
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Refresh All — logo-green gradient button with SVG icon */}
          <button onClick={refreshAll} className={styles.refreshAll}>
            <RefreshIcon size={16} />
            Refresh All
          </button>
        </div>

        {/* ── MAIN 2-COL GRID — layout unchanged ── */}
        <div className={styles.mainGrid}>

          {/* ── LEFT: MEAL CARDS ── */}
          <div className={styles.mealsColumn}>
            {mealPlan &&
              Object.entries(mealPlan).map(([meal, foods], mealIdx) => (
                <div
                  key={meal}
                  className={styles.mealCard}
                  /* Staggered entrance animation delay per card */
                  style={{ animationDelay: `${mealIdx * 0.12}s` }}
                >
                  {/* Subtle accent strip — top border gradient */}
                  <div className={styles.mealCardAccent} />

                  <div className={styles.mealHeader}>
                    <div className={styles.mealTitleRow}>
                      {/* Meal-type SVG icon (breakfast/lunch/dinner) */}
                      <div className={styles.mealIconWrap}>
                        <MealIcon type={meal} />
                      </div>
                      <h3>{meal}</h3>
                    </div>

                    {/* Per-meal refresh with rotation animation */}
                    <button
                      onClick={() => refreshMeal(meal)}
                      className={styles.refreshBtn}
                      title={`Refresh ${meal}`}
                    >
                      <RefreshIcon size={13} />
                      Refresh
                    </button>
                  </div>

                  {/* Food items */}
                  <div className={styles.foodList}>
                    {foods.map((f, i) => (
                      <div
                        key={i}
                        className={styles.foodItem}
                        style={{ animationDelay: `${mealIdx * 0.12 + i * 0.07}s` }}
                      >
                        {/* Calorie pill badge */}
                        <div className={styles.foodTop}>
                          <div className={styles.foodNameRow}>
                            <ForkIcon />
                            <b className={styles.foodName}>{f.name}</b>
                          </div>
                          <span className={styles.caloriePill}>
                            🔥 {f.calories} kcal
                          </span>
                        </div>

                        {/* Ingredients with leaf icon */}
                        <p className={styles.ingredients}>
                          <LeafIcon />
                          <span><b>Ingredients:</b> {f.ingredients?.split("|").join(" | ")} </span>
                        </p>

                        {/* Log meal button — green → logged state */}
                        <button
                          disabled={loggedMeals[f.name]}
                          onClick={() => logMeal(meal, f)}
                          className={
                            loggedMeals[f.name]
                              ? styles.loggedBtn
                              : styles.logBtn
                          }
                        >
                          {loggedMeals[f.name] ? (
                            <>
                              <CheckIcon /> Logged
                            </>
                          ) : (
                            <>
                              <ForkIcon /> Log Meal
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* ── RIGHT: NUTRIENT SUMMARY ── */}
          <div className={styles.summaryCard}>
            {/* SVG decorative dots top-right — echoes logo dot ring */}
            <svg className={styles.summaryDots} width="80" height="80" viewBox="0 0 80 80">
              {[0,60,120,180,240,300].map((deg, i) => {
                const r = 32, cx = 40, cy = 40;
                const x = cx + r * Math.cos((deg * Math.PI) / 180);
                const y = cy + r * Math.sin((deg * Math.PI) / 180);
                return <circle key={i} cx={x} cy={y} r="4" fill="#22c55e" opacity={0.25 + i*0.1}/>;
              })}
            </svg>

            <h3 className={styles.summaryTitle}>
              <SparkleIcon />
              Nutrient Summary
            </h3>

            {/* ── CALORIE DONUT CHART ── */}
            <div className={styles.circleWrapper}>
              <svg width="160" height="160" className={styles.donutSvg}>
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80"/>
                    <stop offset="100%" stopColor="#15803d"/>
                  </linearGradient>
                  {/* Glow filter — halo effect like logo glints */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Track ring */}
                <circle cx="80" cy="80" r="70" className={styles.circleBg} />
                {/* Progress ring with logo-green gradient + glow */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className={styles.circleProgress}
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * caloriePercent) / 100}
                  filter="url(#glow)"
                />
                {/* Inner amber accent ring — echoes orange fruit in logo */}
                <circle
                  cx="80" cy="80" r="56"
                  fill="none"
                  stroke="#fef3c7"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  opacity="0.8"
                />
              </svg>

              <div className={styles.circleText}>
                <h2>{Math.round(nutrition.totalCalories)}</h2>
                <p className={styles.circleSubLabel}>kcal consumed</p>
                <p className={styles.circleGoalLabel}>
                  Goal: {Math.round(nutrition.targetCalories)} kcal
                </p>
                {/* Percentage indicator */}
                <span className={styles.percentBadge}>
                  {Math.round(caloriePercent)}%
                </span>
              </div>
            </div>

            {/* ── MACRO BARS with colored labels and icons ── */}
            <div className={styles.macrosSection}>
              {macroConfig.map(({ name, total, target, color, icon, bg }) => {
                const percent = target ? (total / target) * 100 : 0;
                return (
                  <div key={name} className={styles.macroRow}>
                    <div className={styles.macroLabelRow}>
                      {/* Icon + name */}
                      <div className={styles.macroNameGroup} style={{ background: bg }}>
                        {icon}
                        <span className={styles.macroName} style={{ color }}>{name}</span>
                      </div>
                      <span className={styles.macroValues}>
                        <b style={{ color }}>{Math.round(total)}g</b>
                        <span className={styles.macroSep}>/</span>
                        {Math.round(target)}g
                      </span>
                    </div>

                    {/* Progress bar — colored per macro */}
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${Math.min(percent, 100)}%`,
                          background: `linear-gradient(90deg, ${color}cc, ${color})`
                        }}
                      />
                      {/* Shimmer overlay */}
                      <div className={styles.progressShimmer}/>
                    </div>

                    {/* Percentage label */}
                    <span className={styles.macroPercent} style={{ color }}>
                      {Math.round(Math.min(percent, 100))}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── Goal indicator chip ── */}
            <div className={styles.goalChip}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#22c55e" strokeWidth="2"/>
                <circle cx="12" cy="12" r="5" fill="#22c55e" opacity="0.3"/>
                <circle cx="12" cy="12" r="2" fill="#15803d"/>
              </svg>
              On track for today's goal
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Meals;