import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import styles from "./Signup.module.css";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email || !form.password) {
      setError("All fields are required");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const uid = res.user.uid;

      await setDoc(doc(db, "users", uid), {
        email: form.email,
        onboardingComplete: false,
        createdAt: serverTimestamp(),
      });

      localStorage.setItem("uid", uid);

      navigate("/steps/basic-profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1>Create Account</h1>
        <p className={styles.subtitle}>
          Start your journey with NutriGuide
        </p>

        <form onSubmit={handleSignup}>
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          {error && <span className={styles.error}>{error}</span>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
