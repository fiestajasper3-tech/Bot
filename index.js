const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Initialize Groq with your new key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Check for @mention
  if (message.mentions.has(client.user) && !message.mentions.everyone) {
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return message.reply("I'm here! Ask me any coding question.");

    try {
      await message.channel.sendTyping();

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are an expert coding assistant. Give clear, concise code examples using Markdown." },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile", // Very strong at coding
      });

      let response = chatCompletion.choices[0].message.content;

      if (response.length > 2000) {
        response = response.substring(0, 1900) + "... (truncated)";
      }

      await message.reply(response);
    } catch (error) {
      console.error(error);
      message.reply("I had trouble reaching my brain. Try again!");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
