import styles from "./Navbar.module.css";
import logo from "../../assets/logo.png";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>

        {/* LEFT: Logo */}
        <div
          className={styles.left}
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="NutriGuide Logo" className={styles.logo} />
          <span className={styles.brandText}>NutriGuide</span>
        </div>

        {/* CENTER: Links */}
        <ul className={styles.navLinks}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
            >
              Home
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/nutrition-basics"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
            >
              Nutrition Basics
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/food-groups"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
            >
              Exercise Basics
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/healthy-tips"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
            >
              Healthy Tips
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
            >
              About
            </NavLink>
          </li>
        </ul>

        {/* RIGHT: Buttons */}
        <div className={styles.right}>
          <button
            className={styles.loginBtn}
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className={styles.ctaBtn}
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
