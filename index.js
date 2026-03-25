const fetch = require("node-fetch");

const API_KEY = process.env.OPENAI_API_KEY;

async function sendMessage(message) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const data = await res.json();
    console.log("Reply:", data.choices[0].message.content);

  } catch (err) {
    console.error("Error:", err);
  }
}

sendMessage("Hello!");