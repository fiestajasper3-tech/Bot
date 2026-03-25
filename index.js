try {
    await message.channel.sendTyping();

    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant", // ⚡ Switched to the faster model
    });

    const reply = chatCompletion.choices[0]?.message?.content;
    await message.reply(reply);

} catch (err) {
    // If we hit a rate limit (Error 429)
    if (err.status === 429) {
        console.log("⏳ Rate limit hit. Retrying in 3 seconds...");
        await new Promise(res => setTimeout(res, 3000));
        // Try one more time automatically
        try {
            const retry = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.1-8b-instant",
            });
            return await message.reply(retry.choices[0]?.message?.content);
        } catch (secondErr) {
            return message.reply("❌ The AI is very busy right now. Please wait 10 seconds.");
        }
    }
    console.error(err);
}
