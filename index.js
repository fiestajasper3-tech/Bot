client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    if (!prompt) return message.reply("I'm ready to code! Paste your error or ask a question.");

    try {
        await message.channel.sendTyping();

        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `You are an expert Senior Software Engineer. 
                    - When asked for code, always provide functional, clean examples.
                    - Always wrap code in triple backticks (\`\`\`) with the language name (e.g., \`\`\`javascript).
                    - If the user provides an error, explain WHY it happened and how to fix it.
                    - Keep explanations brief and focus on the code.
                    - Do not use markdown that is too complex for Discord mobile.` 
                },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile", // This model is excellent for coding
            temperature: 0.3, // Lower temperature makes the AI more "factual" and less "creative"
        });

        let aiResponse = completion.choices[0]?.message?.content;

        // --- THE "ANTI-ERROR" CHECK ---
        // Discord crashes if we send more than 2000 characters.
        if (aiResponse.length > 2000) {
            // We split the message or send it as a file (Advanced)
            // For now, we'll just trim it safely to keep the bot online
            aiResponse = aiResponse.substring(0, 1950) + "... (Message too long for Discord)";
        }

        await message.reply(aiResponse);

    } catch (err) {
        console.error("AI Error:", err.message);
        // This prevents the bot from crashing if the AI service is down
        message.reply("⚠️ I'm having trouble processing that code. Check your syntax or try a shorter snippet!");
    }
});
