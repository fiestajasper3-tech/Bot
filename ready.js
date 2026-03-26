const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Logged in as ${client.user.tag}`);
        
        // Register slash commands here
        try {
            await client.application.commands.create({
                name: 'reset',
                description: 'Restarts the bot (Owner only)'
            });
            console.log("⚓ Slash commands registered!");
        } catch (error) {
            console.error("Failed to register commands:", error);
        }
    },
};
