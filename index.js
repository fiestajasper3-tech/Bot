const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Fast & Free for 2026

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user) && !message.mentions.everyone) {
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return message.reply("I'm awake! How can I help you code?");

    try {
      await message.channel.sendTyping();

      // System instruction is built into the prompt for the free tier
      const fullPrompt = `You are a helpful coding assistant. Answer this: ${prompt}`;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text();

      // Fix Discord 2000 character limit
      if (text.length > 2000) text = text.substring(0, 1900) + "...";
      await message.reply(text);

    } catch (err) {
      console.error(err);
      message.reply("❌ Google AI is busy. Try again in a minute!");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
