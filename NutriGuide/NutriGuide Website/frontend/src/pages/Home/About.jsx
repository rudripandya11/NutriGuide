import styles from "./About.module.css";

const values = [
  {
    icon: "❤️",
    title: "Health First",
    description:
      "We prioritize evidence-based nutrition information to help you make informed decisions about your health.",
  },
  {
    icon: "🧠",
    title: "Accessible Information",
    description:
      "Complex nutritional science made simple, practical and easy to understand for everyone in everyday life.",
  },
  {
    icon: "📘",
    title: "Educational Focus",
    description:
      "Our content is designed to educate, guide, and empower you to take control of your nutrition journey.",
  },
  {
    icon: "👥",
    title: "Community Support",
    description:
      "Building a supportive community of health-conscious individuals committed to better nutrition and wellness.",
  },
];

const About = () => {
  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBlobLeft} />
        <div className={styles.heroBlobRight} />

        <span className={styles.badge}>🌱 About Us</span>
        <h1>Our Mission</h1>
        <p>
          We're dedicated to promoting awareness about nutrition and healthy
          lifestyle choices through accessible, educational content.
        </p>
      </section>

      {/* STORY */}
      <section className={styles.story}>
        <div className={styles.storyLabel}>Our Story</div>
        <h2>Why NutriGuide?</h2>

        <div className={styles.storyCards}>
          <div className={styles.storyCard}>
            NutriGuide was created with a simple goal; to make nutrition
            education accessible to everyone.
          </div>
          <div className={styles.storyCard}>
            In today's world of conflicting diet advice and complex food labels,
            it can be overwhelming to make healthy choices.
          </div>
          <div className={styles.storyCard}>
            Whether you're a student learning about nutrition or someone looking
            to improve eating habits, NutriGuide provides the knowledge you need.
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className={styles.valuesSection}>
        <div className={styles.valuesSectionHeader}>
          <div className={styles.sectionLabel}>What We Stand For</div>
          <h2>Our Values</h2>
          <p>The principles that guide everything we create and share.</p>
        </div>

        <div className={styles.grid}>
          {values.map((item, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconWrap}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className={styles.disclaimer}>
        <div className={styles.disclaimerBox}>
          <div className={styles.alertIconWrap}>⚠️</div>
          <h3>Educational Disclaimer</h3>
          <p>
            The information provided on NutriGuide is for educational
            purposes only and should not be considered medical advice.
            Consult a healthcare professional for personalized guidance.
          </p>
          <div className={styles.disclaimerTag}>
            <span>🩺</span> Not a substitute for medical advice
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;