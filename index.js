const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');
const http = require('http');
require('dotenv').config();

// 1. RAILWAY HEALTH CHECK (Keeps the bot from "crashing" on the dashboard)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('AI Bot is Awake!');
}).listen(process.env.PORT || 8080);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. STARTUP LOG
client.once('ready', () => {
    console.log(`-----------------------------------------`);
    console.log(`🤖 AI ONLINE: Logged in as ${client.user.tag}`);
    console.log(`-----------------------------------------`);
});

// 3. AI CHAT LOGIC (Mention the bot to talk)
client.on('messageCreate', async (message) => {
    // Ignore other bots or messages that don't mention this bot
    if (message.author.bot || !message.mentions.has(client.user)) return;

    // Clean the message
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return message.reply("I'm listening! What's on your mind?");

    try {
        await message.channel.sendTyping();

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful and witty AI assistant living inside a Discord server." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
        });

        const reply = completion.choices[0]?.message?.content;
        await message.reply(reply || "My brain took a tiny nap. Try again?");

    } catch (err) {
        console.error("AI Error:", err.message);
        message.reply("⚠️ I'm having trouble connecting to my AI brain right now.");
    }
});

// 4. ANTI-CRASH (The Safety Net)
process.on('unhandledRejection', error => console.error('Error:', error));
process.on('uncaughtException', error => console.error('Critical Error:', error));

client.login(process.env.TOKEN);
