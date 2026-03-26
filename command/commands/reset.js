const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Force restarts the bot (Owner only)'),
    async execute(interaction) {
        // 🛑 REPLACE THIS with your real 18-digit Discord User ID
        const developerID = "YOUR_DISCORD_ID_HERE"; 

        if (interaction.user.id !== developerID) {
            return interaction.reply({ 
                content: "❌ You aren't my developer! Only they can reset me.", 
                ephemeral: true 
            });
        }

        await interaction.reply("🔄 **Rebooting...** See you in about 10 seconds!");

        // Tell the Node.js process to close with an error code
        // Railway will see this "crash" and restart the bot automatically
        setTimeout(() => {
            process.exit(1); 
        }, 1000);
    },
};
