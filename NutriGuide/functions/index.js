const functions = require("firebase-functions");
const fetch = require("node-fetch");

exports.exchangeFitbitToken = functions.https.onRequest(async (req, res) => {

  const code = req.body.code;

  const clientId = "23TXGZ";
  const clientSecret = "b49d8970d90832ec71de1d9edad688e2";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {

    const response = await fetch("https://api.fitbit.com/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `client_id=${clientId}&grant_type=authorization_code&redirect_uri=http://localhost:5173/fitbit-callback&code=${code}`
    });

    const data = await response.json();

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error exchanging Fitbit token");
  }

});