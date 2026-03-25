const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

// Use 'gemini-1.5-flash' for faster, more stable replies than 'pro'
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function chatWithAI(prompt, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            // If it's a "Busy" error (503) or "Rate Limit" (429)
            if (i < retries - 1) {
                console.log(`Google is busy... retrying (Attempt ${i + 1})`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            } else {
                throw error; // If it fails after 3 tries, give up
            }
        }
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();

    try {
        await message.channel.sendTyping();
        const response = await chatWithAI(prompt);
        await message.reply(response);
    } catch (err) {
        message.reply("❌ Google AI is currently overloaded. Please try again in 1 minute!");
    }
});
