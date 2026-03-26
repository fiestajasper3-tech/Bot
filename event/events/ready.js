const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady, // Tells the handler to run this when the bot is ready
    once: true,               // Ensures this only runs once per startup
    async execute(client) {
        console.log(`-----------------------------------------`);
        console.log(`✅ SUCCESS: Logged in as ${client.user.tag}`);
        console.log(`🌐 Connected to ${client.guilds.cache.size} server(s)`);
        console.log(`-----------------------------------------`);

        // 1. AUTO-REGISTER SLASH COMMANDS
        // This syncs everything in your /commands folder to Discord
        try {
            const commandData = client.commands.map(cmd => cmd.data.toJSON());
            await client.application.commands.set(commandData);
            console.log("⚓ Slash commands (like /reset and /ping) are now live!");
        } catch (error) {
            console.error("❌ Failed to register slash commands:", error);
        }

        // 2. SET BOT STATUS
        // This shows up under the bot's name in the member list
        client.user.setActivity('with Groq AI ⚡', { type: ActivityType.Playing });
    },
};
