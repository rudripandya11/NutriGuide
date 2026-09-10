import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <h3 className={styles.logo}>NutriGuide</h3>

        <p className={styles.text}>
          Your intelligent Indian nutrition companion for a healthier lifestyle.
        </p>

        <p className={styles.copy}>
          © 2026 NutriGuide. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
