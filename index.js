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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are a helpful coding assistant. When a user mentions you, provide clear code examples and explanations. Use Markdown for all code blocks."
});

client.once('ready', () => {
  console.log(`Bot is live! Mention me in Discord to chat.`);
});

client.on('messageCreate', async (message) => {
  // 1. Ignore other bots
  if (message.author.bot) return;

  // 2. Check if the bot was mentioned
  if (message.mentions.has(client.user) && !message.mentions.everyone) {
    
    // Remove the mention from the text so the AI doesn't see "<@123456789>"
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!prompt) return message.reply("How can I help you with your code today?");

    try {
      await message.channel.sendTyping();

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Discord limit check
      if (text.length > 2000) {
        text = text.substring(0, 1900) + "... (truncated)";
      }

      // 3. Reply directly to the user's message
      await message.reply({
        content: text,
        allowedMentions: { repliedUser: true } 
      });

    } catch (error) {
      console.error(error);
      message.reply("My brain stalled! Try asking that again.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
