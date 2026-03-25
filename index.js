const { Client, GatewayIntentBits } = require('discord.js');
const { Groq } = require('groq-sdk');
const http = require('http');
require('dotenv').config();

// --- RAILWAY HEALTH CHECK ---
http.createServer((req, res) => { res.write('OK'); res.end(); }).listen(process.env.PORT || 8080);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

client.once('ready', () => {
    console.log(`⚡ Groq Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return;

    try {
        await message.channel.sendTyping();

        const chatCompletion = await groq.chat.completions.create({
            // "llama-3.3-70b-versatile" is one of the best free models in 2026
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });

        const reply = chatCompletion.choices[0]?.message?.content;
        await message.reply(reply || "I'm drawing a blank. Try asking again!");

    } catch (err) {
        console.error("Groq API Error:", err);
        message.reply("❌ Groq is feeling a bit slow. Try again in a moment!");
    }
});

client.login(process.env.TOKEN);
