const { Events } = require('discord.js');
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // 1. Safety Checks: Don't reply to bots or messages without a mention
        if (message.author.bot || !message.mentions.has(message.client.user)) return;

        // 2. Clean the message (remove the <@bot_id>)
        const prompt = message.content.replace(`<@${message.client.user.id}>`, '').trim();
        if (!prompt) return message.reply("How can I help you today?");

        try {
            await message.channel.sendTyping();

            // 3. Call the Groq AI
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
            });

            const reply = completion.choices[0]?.message?.content;
            await message.reply(reply || "I'm thinking... but my brain is empty!");

        } catch (err) {
            console.error("AI Error:", err.message);
            if (err.status === 429) return message.reply("⏳ Slow down! I'm on a free limit.");
            message.reply("❌ Something went wrong with my AI connection.");
        }
    },
};
