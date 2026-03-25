const fetch = require("node-fetch");

// Get API key from Railway Variables
const API_KEY = process.env.API_KEY;

// Change this if Verba gives you a specific endpoint
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

    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

// Test message
sendMessage("Hello from Railway bot!");