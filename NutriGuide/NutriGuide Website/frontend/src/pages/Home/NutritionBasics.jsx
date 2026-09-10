import styles from "./NutritionBasics.module.css";

const nutrients = [
  {
    icon: "⚡",
    name: "Carbohydrates",
    description: "Your body's main energy source. Carbs are broken down into glucose, which fuels your muscles, brain, and other organs.",
    foods: ["Rice", "Bread", "Pasta", "Potatoes", "Fruits"],
  },
  {
    icon: "🥩",
    name: "Proteins",
    description: "The building blocks of your body. Proteins are essential for muscle growth, tissue repair, and producing enzymes and hormones.",
    foods: ["Eggs", "Chicken", "Fish", "Beans", "Lentils"],
  },
  {
    icon: "🥑",
    name: "Fats",
    description: "Essential for brain health, hormone production, and absorbing vitamins. Choose healthy unsaturated fats over saturated fats.",
    foods: ["Avocados", "Nuts", "Olive Oil", "Seeds"],
  },
  {
    icon: "☀️",
    name: "Vitamins",
    description: "Vital for immunity, growth, and overall health. Each vitamin plays unique roles in keeping your body functioning properly.",
    foods: ["Fruits", "Vegetables", "Dairy"],
  },
  {
    icon: "💎",
    name: "Minerals",
    description: "Support bone health, fluid balance, and many metabolic processes. Key minerals include calcium, iron, and potassium.",
    foods: ["Milk", "Spinach", "Bananas", "Nuts"],
  },
  {
    icon: "🌾",
    name: "Fiber",
    description: "Crucial for digestive health. Fiber helps maintain bowel regularity, controls blood sugar, and keeps you feeling full longer.",
    foods: ["Whole Grains", "Vegetables", "Fruits"],
  },
];

const NutritionBasics = () => {
  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero}>

        {/* Animated blob left */}
        <svg className={styles.heroBlobLeft} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blobGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
          <path fill="url(#blobGrad1)" d="M320,180Q290,220,260,260Q230,300,180,310Q130,320,100,280Q70,240,60,190Q50,140,80,100Q110,60,160,50Q210,40,260,60Q310,80,330,130Q350,180,320,180Z" />
        </svg>

        {/* Animated blob right */}
        <svg className={styles.heroBlobRight} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blobGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <path fill="url(#blobGrad2)" d="M300,200Q270,250,230,270Q190,290,150,270Q110,250,90,200Q70,150,100,110Q130,70,180,60Q230,50,270,80Q310,110,320,160Q330,210,300,200Z" />
        </svg>

        {/* Sparkles */}
        <svg className={styles.heroSparkles} viewBox="0 0 1200 500" xmlns="http://www.w3.org/2000/svg">
          <g className={styles.sparkle1}>
            <path d="M100,80 L104,92 L116,96 L104,100 L100,112 L96,100 L84,96 L96,92 Z" fill="#22c55e" opacity="0.7"/>
          </g>
          <g className={styles.sparkle2}>
            <path d="M1100,60 L103,72 L115,76 L103,80 L1100,92 L97,80 L85,76 L97,72 Z" fill="#0d9488" opacity="0.6"/>
            <path d="M1100,60 L1104,72 L1116,76 L1104,80 L1100,92 L1096,80 L1084,76 L1096,72 Z" fill="#0d9488" opacity="0.6"/>
          </g>
          <g className={styles.sparkle3}>
            <path d="M600,30 L603,39 L612,42 L603,45 L600,54 L597,45 L588,42 L597,39 Z" fill="#fbbf24" opacity="0.8"/>
          </g>
          <g className={styles.sparkle4}>
            <path d="M200,400 L204,412 L216,416 L204,420 L200,432 L196,420 L184,416 L196,412 Z" fill="#16a34a" opacity="0.5"/>
          </g>
          <g className={styles.sparkle5}>
            <path d="M950,380 L953,389 L962,392 L953,395 L950,404 L947,395 L938,392 L947,389 Z" fill="#f97316" opacity="0.5"/>
          </g>
          {/* floating leaf dots */}
          <circle cx="50" cy="200" r="5" fill="#22c55e" opacity="0.3">
            <animate attributeName="cy" values="200;180;200" dur="4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1150" cy="150" r="4" fill="#0d9488" opacity="0.3">
            <animate attributeName="cy" values="150;170;150" dur="5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="700" cy="450" r="6" fill="#fbbf24" opacity="0.25">
            <animate attributeName="cy" values="450;430;450" dur="6s" repeatCount="indefinite"/>
          </circle>
        </svg>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            🌿 Your Health Guide
          </div>
          <h1>Nutrition <span>Basics</span></h1>
          <p>Essential nutrients your body needs to thrive — understand what fuels you from the inside out.</p>
        </div>

        {/* Wave */}
        <svg className={styles.heroWave} viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,70 L0,70 Z" fill="#f0fdf4"/>
        </svg>
      </section>

      {/* GRID */}
      <section className={styles.section}>
        <div className={styles.grid}>
          {nutrients.map((item, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconWrap}>{item.icon}</div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className={styles.sourcesLabel}>Food Sources</div>
              <ul>
                {item.foods.map((food, i) => (
                  <li key={i}>{food}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM BANNER */}
      <div className={styles.banner}>
        {/* Decorative leaves */}
        <svg className={styles.bannerLeaf} style={{top: -30, left: -30, width: 200}} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M100,180 Q20,120 40,40 Q80,10 140,60 Q180,100 100,180Z" fill="white"/>
        </svg>
        <svg className={styles.bannerLeaf} style={{bottom: -20, right: -20, width: 180}} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M100,20 Q180,80 160,160 Q120,190 60,140 Q20,100 100,20Z" fill="white"/>
        </svg>
        <h2>Fuel Your Body Right 🌿</h2>
        <p>Every nutrient plays a vital role. Balance is the key to a healthy, energetic life.</p>
      </div>

    </div>
  );
};

export default NutritionBasics;