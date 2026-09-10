import styles from "./CTASection.module.css";
import { useNavigate } from "react-router-dom";
import { FaRocket } from "react-icons/fa";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className={styles.wrapper}>
      <div className={styles.badge}>
        🚀 Start for Free
      </div>

      <h2 className={styles.title}>
        Ready to Transform Your Health Journey?
      </h2>

      <p className={styles.subtitle}>
        Join thousands of users who are eating smarter, feeling better,
        and living healthier with NutriGuide.
      </p>

      {/* CTA → SIGNUP */}
      <button
        className={styles.ctaBtn}
        onClick={() => navigate("/signup")}
      >
        Get Started Free →
      </button>
    </section>
  );
}
