const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

client.once('ready', () => {
  console.log(`✅ ChatGPT Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  // Only reply if the bot is @mentioned
  if (message.mentions.has(client.user) && !message.mentions.everyone) {
    
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return message.reply("I'm here! Ask me any coding question.");

    try {
      await message.channel.sendTyping();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Fastest and most affordable coding model in 2026
        messages: [
          { role: "system", content: "You are a professional coding assistant. Provide clean code blocks and helpful explanations." },
          { role: "user", content: prompt }
        ],
      });

      let responseText = completion.choices[0].message.content;

      // Handle Discord's 2000 character limit
      if (responseText.length > 2000) {
        responseText = responseText.substring(0, 1900) + "... (Response truncated)";
      }

      await message.reply(responseText);

    } catch (error) {
      console.error("OpenAI Error:", error);
      message.reply("❌ Error: Make sure your OpenAI account has a paid balance ($5 minimum)!");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
