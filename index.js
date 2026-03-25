const { Client, GatewayIntentBits, Partials } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

// 1. Setup the Client with "Partials" and "Intents"
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Required to read the text
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message] 
});

// 2. Setup OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // Make sure this matches Railway
  defaultHeaders: {
    "HTTP-Referer": "https://github.com",
    "X-Title": "Discord Bot",
  }
});

client.once('ready', () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    // --- DEBUG: This will show in your Railway logs ---
    console.log(`Message seen from ${message.author.tag}: ${message.content}`);

    if (message.author.bot) return;

    // Check if the bot was mentioned
    if (!message.mentions.has(client.user)) return;

    try {
        await message.channel.sendTyping();

        const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
        
        const response = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001", // Or "meta-llama/llama-3.1-8b-instruct:free"
            messages: [{ role: "user", content: prompt || "Hello!" }],
        });

        const reply = response.choices[0].message.content;
