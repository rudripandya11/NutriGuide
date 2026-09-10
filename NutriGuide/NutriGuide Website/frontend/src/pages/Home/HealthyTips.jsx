import styles from "./HealthyTips.module.css";
import { useNavigate } from "react-router-dom";

const tips = [
  {
    title: "Eat Balanced Meals",
    description:
      "Include foods from all food groups with vegetables, proteins, whole grains, and healthy fats for balanced nutrition.",
    icon: "🥗",
    tag: "Nutrition",
  },
  {
    title: "Control Portion Sizes",
    description:
      "Use smaller plates and listen to your hunger cues to avoid overeating and improve portion control.",
    icon: "⚖️",
    tag: "Mindfulness",
  },
  {
    title: "Limit Sugar, Salt & Fried Food",
    description:
      "Reduce processed foods high in sugar and sodium. Choose baked, grilled, or steamed meals instead.",
    icon: "🚫",
    tag: "Avoid",
  },
  {
    title: "Drink Enough Water",
    description:
      "Stay hydrated by drinking at least 8 glasses of water daily. Water helps with digestion and nutrient absorption.",
    icon: "💧",
    tag: "Hydration",
  },
  {
    title: "Don't Skip Breakfast",
    description:
      "Start your day with a nutritious breakfast to kickstart your metabolism and provide energy.",
    icon: "🌅",
    tag: "Daily Habit",
  },
  {
    title: "Eat at Regular Times",
    description:
      "Maintain consistent meal timings to regulate your metabolism and prevent overeating.",
    icon: "🕐",
    tag: "Routine",
  },
  {
    title: "Read Food Labels",
    description:
      "Check nutrition labels while shopping and choose foods with better ingredients and less sugar.",
    icon: "🏷️",
    tag: "Smart Shopping",
  },
  {
    title: "Practice Mindful Eating",
    description:
      "Eat slowly, enjoy every bite of your food, and recognize when your body feels full and satisfied naturally.",
    icon: "🧘",
    tag: "Mindfulness",
  },
  {
    title: "Include Healthy Snacks",
    description:
      "Choose fruits, nuts, yogurt, or seeds instead of processed snacks and unhealthy junk food.",
    icon: "🍎",
    tag: "Snacking",
  },
];

const checklistItems = [
  "Eat 5+ servings of fruits & vegetables",
  "Choose whole grains over refined",
  "Include protein in every meal",
  "Limit sugary drinks",
  "Drink plenty of water",
  "Control portion sizes",
  "Eat breakfast daily",
  "Plan meals in advance",
];

const HealthyTips = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>

      {/* HEADER */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span>🌿</span> NutritionGuide
        </div>
        <h1>
          Healthy <span className={styles.heroAccent}>Eating</span> Tips
        </h1>
        <p>
          Simple and practical guidelines to help you build better eating habits — one small step at a time.
        </p>

        <div className={styles.heroStats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>9</span>
            <span className={styles.statLabel}>Tips</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>8</span>
            <span className={styles.statLabel}>Daily Goals</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>100%</span>
            <span className={styles.statLabel}>Free</span>
          </div>
        </div>

        <div className={styles.scrollHint}>
          <span>Explore</span>
          <div className={styles.scrollArrow}></div>
        </div>
      </section>

      {/* TIPS GRID */}
      <section className={styles.tipsSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLabel}>Nutrition Essentials</div>
          <h2><span>9</span> Habits to Transform Your Diet</h2>
          <p>Evidence-backed tips to help you eat smarter, feel better, and live healthier.</p>
        </div>

        <div className={styles.grid}>
          {tips.map((tip, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.number}>{index + 1}</span>
                <h3>{tip.title}</h3>
              </div>
              <p>{tip.description}</p>
              <div className={styles.cardTag}>
                <span>{tip.icon}</span>
                {tip.tag}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CHECKLIST */}
      <section className={styles.checklistSection}>
        <div className={styles.checklistInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>Daily Checklist</div>
            <h2>Your Daily Nutrition Goals</h2>
            <p>Track these habits every day for a healthier lifestyle.</p>
          </div>

          <div className={styles.checklistBox}>
            <div className={styles.checklistGrid}>
              {checklistItems.map((item, index) => (
                <div key={index} className={styles.checkItem}>
                  <span className={styles.tick}>✓</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.ctaStrip}>
            <h3>Ready to start your healthy journey?</h3>
            <p>Small consistent changes lead to big, lasting results.</p>
            <button
              className={styles.ctaBtn}
              onClick={() => navigate("/signup")}
            >
              <span>🌱</span> Get Started Today
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HealthyTips;