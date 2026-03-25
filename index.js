const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// 1. CRASH PROTECTION: Check if the API key is missing
if (!process.env.GEMINI_KEY) {
    console.error("❌ CRASH: GEMINI_KEY is missing in Railway Variables!");
    process.exit(1); 
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();

    try {
        await message.channel.sendTyping();
        const result = await model.generateContent(prompt);
        await message.reply(result.response.text());
    } catch (err) {
        console.error("API Error:", err);
        // This is the "Busy" fix we talked about
        message.reply("❌ Google is busy or rate-limited. Try again in 10 seconds.");
    }
});

client.login(process.env.TOKEN);
