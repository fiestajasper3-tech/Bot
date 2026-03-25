const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", // Using the 2.5 Flash model for 2026
  systemInstruction: "You are a helpful coding assistant. When mentioned, provide clear code and short explanations. Always use Markdown."
});

client.once('ready', () => {
  console.log("Gemini Bot is online!");
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Trigger only on @mention
  if (message.mentions.has(client.user) && !message.mentions.everyone) {
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!prompt) return message.reply("How can I help you code today?");

    try {
      await message.channel.sendTyping();

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Discord 2000 character fix
      if (text.length > 2000) {
        text = text.substring(0, 1900) + "... (truncated)";
      }

      await message.reply(text);
    } catch (error) {
      console.error(error);
      message.reply("I'm having trouble connecting to Google's AI. Check your API key!");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
