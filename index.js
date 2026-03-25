const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user) && !message.mentions.everyone) {
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return message.reply("I'm here! What code can I help with?");

    try {
      await message.channel.sendTyping();
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://railway.app"
        },
        body: JSON.stringify({
          model: "qwen/qwen-2.5-coder-32b-instruct:free",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      if (data.error) return message.reply(`❌ AI Error: ${data.error.message}`);
      
      let text = data.choices[0].message.content;
      await message.reply(text.length > 2000 ? text.substring(0, 1950) + "..." : text);
    } catch (err) {
      message.reply("❌ Connection failed. Check Railway Variables!");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
