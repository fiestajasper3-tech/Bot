const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Setup OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com", // Required by OpenRouter
    "X-Title": "My Discord Bot",         // Optional: Shows in your dashboard
  }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();

    try {
        await message.channel.sendTyping();

        const response = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001", // You can change this to any OpenRouter model
            messages: [{ role: "user", content: prompt }],
        });

        const reply = response.choices[0].message.content;
        await message.reply(reply || "I'm not sure what to say.");

    } catch (err) {
        console.error("OpenRouter Error:", err);
        message.reply("❌ There was an error connecting to OpenRouter.");
    }
});

client.login(process.env.TOKEN);
