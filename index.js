const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');
const http = require('http');
require('dotenv').config();

// RAILWAY HEARTBEAT (Mandatory)
http.createServer((req, res) => { res.write('OK'); res.end(); }).listen(process.env.PORT || 8080);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Setup OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://railway.app", // Required by OpenRouter for free tier
    "X-Title": "MyDiscordBot",
  }
});

client.once('ready', () => { console.log(`🤖 OpenRouter Bot is ready as ${client.user.tag}`); });

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return;

    try {
        await message.channel.sendTyping();

        const completion = await openai.chat.completions.create({
            // This "openrouter/free" ID automatically rotates through all free models
            model: "openrouter/free", 
            messages: [{ role: "user", content: prompt }],
        });

        const reply = completion.choices[0].message.content;
        await message.reply(reply);

    } catch (err) {
        console.error("OpenRouter Error:", err.message);
        // If 429 occurs, it means ALL free models are busy (rare)
        if (err.status === 429) {
            message.reply("⏳ All free models are busy. Try again in 30 seconds!");
        } else {
            message.reply("❌ OpenRouter is having trouble. Check your API key!");
        }
    }
});

client.login(process.env.TOKEN);
