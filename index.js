const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// We are using OpenRouter's free "Auto" model or Qwen Coder
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

client.once('ready', () => {
  console.log(`🚀 Bot is live! Mention me for coding help.`);
});

client.on('messageCreate', async (message) => {
  // Ignore other bots
  if (message.author.bot) return;

  // Check if the bot was @mentioned
  if (message.mentions.has(client.user) && !message.mentions.everyone) {
    
    // Clean the prompt (remove the bot's @tag)
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    if (!prompt) return message.reply("I'm here! Ask me a coding question, like: 'How do I center a div?'");

    try {
      await message.channel.sendTyping();

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://railway.app", // Required by OpenRouter
          "X-Title": "Discord Coding Bot"
        },
        body: JSON.stringify({
          model: "openrouter/auto", // OpenRouter will pick the best free model
          messages: [
            { role: "system", content: "You are an elite coding assistant. Provide clean code and short explanations. Use Markdown for code blocks." },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await response.json();
      
      // Safety check for API errors
      if (!data.choices || data.error) {
        throw new Error(data.error?.message || "API Error");
      }

      let aiText = data.choices[0].message.content;

      // Discord character limit fix
      if (aiText.length > 2000) {
        aiText = aiText.substring(0, 1900) + "... (Response too long)";
      }

      await message.reply(aiText);

    } catch (error) {
      console.error(error);
      message.reply("❌ My brain is lagging! Make sure your OpenRouter key is correct in Railway.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
