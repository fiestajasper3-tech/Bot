const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');
const http = require('http');
require('dotenv').config();

// 1. RAILWAY HEALTH CHECK (Must be at the top)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('AI Bot is Active');
}).listen(process.env.PORT || 8080);

// 2. SETUP THE BOT (This defines 'client')
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 3. STARTUP MESSAGE
client.once('ready', () => {
    console.log(`🤖 AI ONLINE: Logged in as ${client.user.tag}`);
});

// 4. AI CHAT LOGIC
client.on('messageCreate', async (message) => {
    // Ignore bots and messages that don't tag this bot
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return message.reply("I'm ready! Paste your code or ask a question.");

    try {
        await message.channel.sendTyping();

        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "You are an expert Senior Developer. Always use code blocks (```js) for code. If there is an error, explain the fix clearly." 
                },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3, 
        });

        const aiResponse = completion.choices[0]?.message?.content;
        
        // Discord limit check
        if (aiResponse.length > 2000) {
            return message.reply(aiResponse.substring(0, 1900) + "... (truncated)");
        }

        await message.reply(aiResponse);

    } catch (err) {
        console.error("AI Error:", err.message);
        message.reply("⚠️ Something went wrong with the AI brain. Try again!");
    }
});

// 5. ANTI-CRASH
process.on('unhandledRejection', error => console.error('Error:', error));

client.login(process.env.TOKEN);
