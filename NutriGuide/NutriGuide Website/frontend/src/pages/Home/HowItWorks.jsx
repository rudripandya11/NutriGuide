import styles from "./HowItWorks.module.css";
import {
  FaUser,
  FaBullseye,
  FaUtensils,
  FaChartLine
} from "react-icons/fa";

export default function HowItWorks() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2>
          How <span>NutriGuide</span> Works
        </h2>
        <p>Start your health journey in four simple steps</p>
      </div>

      <div className={styles.steps}>
        <Step
          number="01"
          icon={<FaUser style={{ color: "#2563eb" }} />}
          title="Create Your Profile"
          text="Enter your health details, dietary preferences, and any existing conditions."
        />

        <Step
          number="02"
          icon={<FaBullseye style={{ color: "#dc2626" }} />}
          title="Set Your Goals"
          text="Choose your health goal – weight loss, gain, maintenance, or healthy lifestyle."
        />

        <Step
          number="03"
          icon={<FaUtensils style={{ color: "#f59e0b" }} />}
          title="Get Personalized Plans"
          text="Receive Indian meal plans and exercises tailored to your needs."
        />

        <Step
          number="04"
          icon={<FaChartLine style={{ color: "#7c3aed" }} />}
          title="Track & Improve"
          text="Log meals, mood, and progress. NutriGuide adapts to your journey."
        />
      </div>
    </section>
  );
}

function Step({ number, icon, title, text }) {
  return (
    <div className={styles.step}>
      <div className={styles.iconBox}>{icon}</div>
      <span className={styles.number}>{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
