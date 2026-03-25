const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

// --- CRASH GUARD ---
const requiredVars = ['TOKEN', 'OPENROUTER_API_KEY'];
requiredVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ CRITICAL ERROR: ${varName} is missing in Railway Variables!`);
        process.exit(1); 
    }
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com", 
    "X-Title": "My Discord Bot",
  }
});

client.once('ready', () => {
    console.log(`✅ OpenRouter Bot is live: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return;

    try {
        await message.channel.sendTyping();

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001", // Or "meta-llama/llama-3.1-8b-instruct:free"
            messages: [{ role: "user", content: prompt }],
        });

        const response = completion.choices[0].message.content;
        await message.reply(response || "I couldn't generate a response.");

    } catch (err) {
        console.error("OpenRouter Error:", err);
        message.reply("❌ Error connecting to OpenRouter. Check your API credits!");
    }
});

client.login(process.env.TOKEN);
