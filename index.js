const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');
const http = require('http');
require('dotenv').config();

// --- 1. RAILWAY PORT FIX ---
// This stops Railway from saying "Crashed" after 60 seconds
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is Alive!');
}).listen(process.env.PORT || 8080);

// --- 2. BOT SETUP ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

client.once('ready', () => {
  console.log(`⚡ Fast Bot is online as ${client.user.tag}`);
});

// --- 3. MESSAGE HANDLING ---
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.mentions.has(client.user)) return;

  const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
  if (!prompt) return;

  try {
    await message.channel.sendTyping();

    const completion = await groq.chat.completions.create({
      // llama-3.3-70b is very smart and free on Groq
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const reply = completion.choices[0]?.message?.content;
    await message.reply(reply || "I'm thinking, but nothing came out!");

  } catch (err) {
    console.error("GROQ ERROR:", err.message);
    
    // Check if we hit the free limit
    if (err.status === 429) {
      return message.reply("⏳ I'm talking too fast! Wait 10 seconds and try again.");
    }
    
    message.reply("❌ Something went wrong, but I'm still online!");
  }
});

// Global error catcher to prevent the "Exit Code 1" crash
process.on('unhandledRejection', error => console.error('Uncaught Error:', error));

client.login(process.env.TOKEN);
