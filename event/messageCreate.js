const { Events } = require('discord.js');
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Don't reply to bots or messages that don't mention your bot
        if (message.author.bot || !message.mentions.has(message.client.user)) return;

        // Clean the message (remove the @mention part)
        const prompt = message.content.replace(`<@${message.client.user.id}>`, '').trim();
        if (!prompt) return message.reply("How can I help you?");

        try {
            await message.channel.sendTyping();

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile", 
            });

            const reply = completion.choices[0]?.message?.content;
            await message.reply(reply || "I'm having trouble thinking right now!");

        } catch (err) {
            console.error("AI Error:", err.message);
            message.reply("❌ API Error. Please check your Groq key in Railway.");
        }
    },
};
