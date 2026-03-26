const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`-----------------------------------------`);
        console.log(`✅ ONLINE: Logged in as ${client.user.tag}`);
        console.log(`-----------------------------------------`);

        // Syncs all files in your /commands folder to Discord
        try {
            const commandData = client.commands.map(cmd => cmd.data.toJSON());
            await client.application.commands.set(commandData);
            console.log("⚓ Slash commands synchronized.");
        } catch (error) {
            console.error("❌ Failed to sync commands:", error);
        }

        // Sets the "Watching/Playing" status
        client.user.setActivity('with Groq AI ⚡', { type: ActivityType.Playing });
    },
};
