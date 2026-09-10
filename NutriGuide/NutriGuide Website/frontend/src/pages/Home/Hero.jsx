import styles from "./Hero.module.css";
import heroImage from "./hero-image.png";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaChartLine, FaBrain, FaBolt } from "react-icons/fa";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>

      {/* MAIN HEADING */}
      <h1 className={styles.mainTitle}>
        Eat Smart, <span>Live Healthy</span> the Indian Way
      </h1>

      {/* TEXT + IMAGE ROW */}
      <div className={styles.contentRow}>

        {/* LEFT TEXT */}
        <p className={styles.description}>
          Personalized nutrition plans based on your health, mood, and budget.
          Discover delicious Indian meals that support your wellness journey.
        </p>

        {/* RIGHT IMAGE */}
        <img
          src={heroImage}
          alt="Healthy Indian Food"
          className={styles.heroImage}
        />

      </div>

      {/* FEATURE BUTTONS */}
      <div className={styles.featureRow}>
        <button><FaUtensils />  Custom Plans</button>
        <button><FaChartLine />  Track Progress</button>
        <button><FaBrain />  Smart Suggestions</button>
        <button><FaBolt />  Quick Recipes</button>
      </div>

      {/* CTA BUTTONS */}
      <div className={styles.ctaRow}>
        <button
          className={styles.primaryBtn}
          onClick={() => navigate("/signup")}
        >
          Start Your Journey
        </button>

        <button
          className={styles.secondaryBtn}
          onClick={() => navigate("/signup")}
        >
          Explore Plans
        </button>
      </div>

    </section>
  );
};

export default Hero;
