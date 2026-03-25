const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');
const http = require('http');
require('dotenv').config();

// 1. Heartbeat for Railway
http.createServer((req, res) => { res.write('OK'); res.end(); }).listen(process.env.PORT || 8080);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // Ensure this is ON in Dev Portal!
    ]
});

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
});

// Catch errors so the bot doesn't die
process.on('unhandledRejection', error => console.error('Uncaught Error:', error));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();

    try {
        await message.channel.sendTyping();
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001", 
            messages: [{ role: "user", content: prompt }],
        });
        await message.reply(completion.choices[0].message.content);
    } catch (err) {
        console.error("OpenRouter Error:", err);
    }
});

client.login(process.env.TOKEN).catch(err => {
    console.error("❌ Failed to login to Discord. Check your TOKEN!");
});
