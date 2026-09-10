import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function FitbitCallback() {

  const navigate = useNavigate();

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      navigate("/dashboard");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        navigate("/login");
        return;
      }

      try {

        const response = await axios.post(
          "http://localhost:5000/fitbit/token",
          {
            code: code,
            firebaseUid: user.uid
          }
        );

        const tokenData = response.data;

        await setDoc(
          doc(db, "users", user.uid, "integrations", "fitbit"),
          {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            fitbit_user_id: tokenData.user_id,
            connected_at: new Date()
          }
        );

      } catch (error) {

        console.error("Fitbit connection failed", error);

      }

      navigate("/dashboard");

    });

    return () => unsubscribe();

  }, [navigate]);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Connecting your Fitbit...</h2>
      <p>Please wait while we sync your health data.</p>
    </div>
  );
}

export default FitbitCallback;