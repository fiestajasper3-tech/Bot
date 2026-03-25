const { Client, GatewayIntentBits } = require('discord.js');
const { Mistral } = require('@mistralai/mistralai');
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

// Initialize Mistral
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

client.once('ready', () => {
    console.log(`🌪️ Mistral Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return;

    try {
        await message.channel.sendTyping();

        const chatResponse = await mistral.chat.complete({
            // "mistral-small-latest" points to Small 4 in 2026
            model: "mistral-small-latest",
            messages: [{ role: "user", content: prompt }],
        });

        const reply = chatResponse.choices[0].message.content;
        await message.reply(reply || "I'm thinking, but nothing is coming out!");

    } catch (err) {
        console.error("Mistral API Error:", err);
        // If it's a rate limit error, Mistral usually says so directly
        message.reply("❌ Mistral is currently resting. Try again in a minute!");
    }
});

client.login(process.env.TOKEN);
