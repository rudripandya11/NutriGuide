import styles from "./Features.module.css";
import {
  FaBullseye,
  FaHeartbeat,
  FaSmile,
  FaDumbbell,
  FaWallet,
  FaBalanceScale
} from "react-icons/fa";

export default function Features() {
  return (
    <section className={styles.features}>
      <div className={styles.header}>
        <h2>
          Everything You Need for <span>Healthy Living</span>
        </h2>
        <p>
          NutriGuide understands your body, emotions, culture, and budget to
          make healthy living practical and sustainable.
        </p>
      </div>

      <div className={styles.grid}>
        <FeatureCard
          icon={<FaBullseye style={{ color: "#10b981" }} />}
          title="Goal-Based Plans"
          text="Whether you want to lose weight, gain muscle, or maintain health – get personalized nutrition tailored to your goals."
        />

        <FeatureCard
          icon={<FaHeartbeat style={{ color: "#ef4444" }} />}
          title="Women's Health"
          text="Phase-based food recommendations to support energy, comfort, and hormonal balance."
        />

        <FeatureCard
          icon={<FaSmile style={{ color: "#f59e0b" }} />}
          title="Mood & Cravings"
          text="Healthier food alternatives that naturally support mood and reduce cravings."
        />

        <FeatureCard
          icon={<FaDumbbell style={{ color: "#3b82f6" }} />}
          title="Exercise Guidance"
          text="Yoga, home workouts, and routines matched to your fitness level."
        />

        <FeatureCard
          icon={<FaWallet style={{ color: "#facc15" }} />}
          title="Budget-Friendly"
          text="Affordable Indian meal plans using local, everyday ingredients."
        />

        <FeatureCard
          icon={<FaBalanceScale style={{ color: "#8b5cf6" }} />}
          title="Balance After Junk"
          text="No guilt. Just smart nutrition suggestions to balance your meals."
        />
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
