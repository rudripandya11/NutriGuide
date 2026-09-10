import styles from "./Header.module.css";
import logo from "../../assets/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const Header = ({ userName }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* LEFT LOGO */}
        <div
          className={styles.left}
          onClick={() => navigate("/dashboard")}
        >
          <img src={logo} alt="NutriGuide" className={styles.logo} />
          <span className={styles.brandText}>NutriGuide</span>
        </div>

        {/* CENTER NAVIGATION */}
        <ul className={styles.navLinks}>
          <li>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              Profile
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/meals"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              Meals
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/exercise"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              Exercise
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/mood"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              Mood
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/female-health"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              Female Health
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/history"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              History
            </NavLink>
          </li>
        </ul>

        {/* RIGHT SIDE */}
        <div className={styles.right} ref={notificationRef}>
          <button
            className={styles.notification}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
          </button>
          
          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <p>No notifications yet</p>
            </div>
          )}
                    {/* ⭐ CLICKABLE PROFILE AVATAR */}
          <div
            className={styles.avatar}
            onClick={() => navigate("/dashboard/profile")}
            title="Go to Profile"
          >
            {userName?.charAt(0) || "U"}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;