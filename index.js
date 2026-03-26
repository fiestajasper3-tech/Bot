const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const http = require('http');
require('dotenv').config();

// 1. RAILWAY HEARTBEAT (Prevents Crashing)
http.createServer((req, res) => { res.write('OK'); res.end(); }).listen(process.env.PORT || 8080);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => { console.log(`🚀 Verba Bot Online as ${client.user.tag}`); });

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    
    try {
        await message.channel.sendTyping();

        // Calling the Verba.ink API
        const response = await axios.post('https://verbal.ink/api/v1/chat', {
            text: prompt,
            model: "verba-gpt-4o" // Verba uses optimized models in 2026
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.VERBA_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const reply = response.data.choices[0].message.content;
        await message.reply(reply || "Verba sent an empty response.");

    } catch (err) {
        console.error("Verba API Error:", err.response?.data || err.message);
        message.reply("❌ Verba API is having trouble. Check your 300 free minutes!");
    }
});

client.login(process.env.TOKEN);
