const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// 1. Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel]
});

// 2. Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are an elite coding assistant. Your name is DevBot. You help users write, debug, and explain code. Always use Markdown code blocks. If the user asks something non-coding related, gently steer them back to programming."
});

client.once('ready', () => {
  console.log(`✅ ${client.user.tag} is online and ready to help!`);
});

client.on('messageCreate', async (message) => {
  // Ignore other bots
  if (message.author.bot) return;

  // 3. Check if the bot was @mentioned
  if (message.mentions.has(client.user) && !message.mentions.everyone) {
    
    // Clean the message (remove the @mention part)
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!prompt) {
      return message.reply("Hey there! Mention me and ask a coding question, like: '@DevBot how do I make a Discord bot?'");
    }

    try {
      // Show "Bot is typing..." on mobile
      await message.channel.sendTyping();

      // Generate AI response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Discord limit is 2000 characters
      if (text.length > 2000) {
        text = text.substring(0, 1900) + "... (Response too long for Discord)";
      }

      // 4. Reply directly to the mention
      await message.reply({
        content: text,
        allowedMentions: { repliedUser: true }
      });

    } catch (error) {
      console.error("AI Error:", error);
      message.reply("⚠️ My circuits fried! Try asking that again in a moment.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
