const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');
const http = require('http');
require('dotenv').config();

// 1. RAILWAY HEALTH CHECK (Must be at the very top)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('AI Bot is Active');
}).listen(process.env.PORT || 8080);

// 2. DEFINE THE CLIENT (This fixes your error!)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 3. STARTUP LOG
client.once('ready', () => {
    console.log(`🤖 AI ONLINE: Logged in as ${client.user.tag}`);
});

// 4. AI CHAT LOGIC
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return message.reply("How can I help with your code today?");

    try {
        await message.channel.sendTyping();

        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "You are a Senior Developer. Provide clean code blocks and explain errors simply." 
                },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3, 
        });

        const aiResponse = completion.choices[0]?.message?.content;
        await message.reply(aiResponse.substring(0, 2000));

    } catch (err) {
        console.error("AI Error:", err.message);
        message.reply("⚠️ AI brain fog! Try a shorter message.");
    }
});

// 5. SAFETY
process.on('unhandledRejection', error => console.error('Error:', error));

client.login(process.env.TOKEN);
