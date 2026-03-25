client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return;

    // Helper function to wait
    const wait = (ms) => new Promise(res => setTimeout(res, ms));

    const askMistral = async (retries = 3) => {
        try {
            await message.channel.sendTyping();
            
            const chatResponse = await mistral.chat.complete({
                model: "mistral-small-latest",
                messages: [{ role: "user", content: prompt }],
            });

            return await message.reply(chatResponse.choices[0].message.content);
        } catch (err) {
            // If it's a Rate Limit (429) and we have retries left
            if (err.status === 429 && retries > 0) {
                console.log(`⏳ Rate limited. Retrying in 3 seconds... (${retries} left)`);
                await wait(3000); 
                return askMistral(retries - 1); // Try again
            }
            
            console.error("Mistral Error:", err);
            message.reply("❌ Mistral is overloaded. Try again in 10 seconds!");
        }
    };

    await askMistral();
});
