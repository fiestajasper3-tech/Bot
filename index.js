const { Client, GatewayIntentBits, Partials } = require('discord.js');
const OpenAI = require('openai');
const http = require('http'); // Required for Railway health check
require('dotenv').config();

// 1. --- RAILWAY HEALTH CHECK ---
// This keeps the bot from crashing/restarting on Railway
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is healthy!');
});

// Railway automatically gives you a PORT variable
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Health check server listening on port ${PORT}`);
});

// 2. --- DISCORD CLIENT SETUP ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // MUST be ON in Dev Portal
    ],
    partials: [Partials.Channel, Partials.Message]
});

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
});

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// 3. --- MESSAGE HANDLER ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    try {
        await message.channel.sendTyping();
        const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001", 
            messages: [{ role: "user", content: prompt || "Hello!" }],
        });

        await message.reply(completion.choices[0].message.content);
    } catch (err) {
        console.error("OpenRouter Error:", err);
        message.reply("⚠️ OpenRouter is having trouble. Check your credits!");
    }
});

// Error handling to prevent crashes from networking blips
client.on('error', console.error);
process.on('unhandledRejection', console.error);

client.login(process.env.TOKEN);
