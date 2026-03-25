const fetch = require("node-fetch");

const API_KEY = process.env.API_KEY;
const BASE_URL = "https://api.verba.ink/v1/chat";

async function sendMessage(message) {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const text = await res.text();
    console.log("RAW RESPONSE:", text);

  } catch (err) {
    console.error("Error:", err);
  }
}

sendMessage("Hello!");