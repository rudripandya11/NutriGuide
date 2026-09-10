require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const admin = require("firebase-admin");

/*
----------------------------------
FIREBASE ADMIN SETUP
----------------------------------
*/

const serviceAccount = require("./nutriguide-23c40-firebase-adminsdk-fbsvc-6831adf46a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/*
----------------------------------
EXPRESS APP SETUP
----------------------------------
*/

const app = express();
app.use(cors());
app.use(express.json());

/*
----------------------------------
CONFIGURATION
----------------------------------
*/

const CLIENT_ID = "23TXGZ";
const CLIENT_SECRET = "b49d8970d90832ec71de1d9edad688e2";
const REDIRECT_URI = "http://localhost:5173/fitbit-callback";

/*
----------------------------------
TEST ROUTE
----------------------------------
*/

app.get("/", (req, res) => {
  res.send("NutriGuide Backend Running");
});

/*
----------------------------------
FITBIT AUTH ROUTE
----------------------------------
*/

app.get("/auth/fitbit", (req, res) => {

  const { firebaseUid } = req.query;

  const scope = encodeURIComponent(
    "activity heartrate sleep nutrition profile"
  );

  const fitbitAuthUrl =
    "https://www.fitbit.com/oauth2/authorize" +
    "?response_type=code" +
    `&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${scope}` +
    `&state=${firebaseUid}` +
    "&prompt=login";

  const logoutRedirect =
    "https://www.fitbit.com/logout?redirect=" +
    encodeURIComponent(fitbitAuthUrl);

  res.redirect(logoutRedirect);

});


/*
----------------------------------
FITBIT TOKEN EXCHANGE
----------------------------------
*/

app.post("/fitbit/token", async (req, res) => {

  const { code, firebaseUid } = req.body;

  try {

    const tokenResponse = await axios.post(
      "https://api.fitbit.com/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        code: code
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const tokenData = tokenResponse.data;

    await db
      .collection("users")
      .doc(firebaseUid)
      .collection("integrations")
      .doc("fitbit")
      .set({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        fitbit_user_id: tokenData.user_id,
        expires_in: tokenData.expires_in,
        connected_at: new Date()
      });

    res.json(tokenData);

  } catch (error) {

    console.error(
      "Fitbit Token Exchange Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Fitbit token exchange failed"
    });

  }

});

/*
----------------------------------
MANUAL WATER UPDATE
----------------------------------
*/

app.post("/water/update", async (req, res) => {

  const { uid, water } = req.body;

  try {

    const today = new Date().toISOString().split("T")[0];

    const ref = db
      .collection("users")
      .doc(uid)
      .collection("fitbit_data")
      .doc(today);

    await ref.set(
      {
        water: `${water} glasses`
      },
      { merge: true }
    );

    res.json({ success: true });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Water update failed"
    });

  }

});

/*
----------------------------------
FETCH FITBIT DATA
----------------------------------
*/

app.get("/fitbit/data/:uid", async (req, res) => {

  const uid = req.params.uid;

  try {

    const integrationDoc = await db
      .collection("users")
      .doc(uid)
      .collection("integrations")
      .doc("fitbit")
      .get();

    if (!integrationDoc.exists) {
      return res.status(404).json({ error: "Fitbit not connected" });
    }

    const { access_token } = integrationDoc.data();

    const today = new Date().toISOString().split("T")[0];

    const headers = { Authorization: `Bearer ${access_token}` };

    const steps = await axios.get(
      `https://api.fitbit.com/1/user/-/activities/steps/date/${today}/1d.json`,
      { headers }
    );

    const sleep = await axios.get(
      `https://api.fitbit.com/1.2/user/-/sleep/date/${today}.json`,
      { headers }
    );

    const water = await axios.get(
      `https://api.fitbit.com/1/user/-/foods/log/water/date/${today}.json`,
      { headers }
    );

    const stepsCount = parseInt(
      steps.data["activities-steps"]?.[0]?.value || 0
    );

    const sleepMinutes = sleep.data.summary?.totalMinutesAsleep || 0;

    const sleepHours = Math.floor(sleepMinutes / 60);
    const sleepRemainingMinutes = sleepMinutes % 60;

    const sleepFormatted = `${sleepHours}h ${sleepRemainingMinutes}m`;

    const waterMl = water.data.summary?.water || 0;
    const fitbitGlasses = Math.round(waterMl / 250);

    const ref = db
      .collection("users")
      .doc(uid)
      .collection("fitbit_data")
      .doc(today);

    const existingDoc = await ref.get();

    let manualWater = 0;

    if (existingDoc.exists) {

      const stored = existingDoc.data().water || "0 glasses";
      manualWater = parseInt(stored);

    }

    const totalWater = Math.max(manualWater, fitbitGlasses);

    const data = {
      steps: stepsCount,
      sleep: sleepFormatted,
      water: `${totalWater} glasses`
    };

    await ref.set(data, { merge: true });

    res.json(data);

  } catch (error) {

    console.error(
      "Fitbit fetch error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to fetch Fitbit data"
    });

  }

});

/*
----------------------------------
SERVER START
----------------------------------
*/

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});