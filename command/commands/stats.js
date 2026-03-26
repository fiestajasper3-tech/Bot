const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Shows the bot\'s current performance'),
    async execute(interaction) {
        const uptime = process.uptime();
        const hrs = Math.floor(uptime / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        
        const statsEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🤖 Bot Performance Stats')
            .addFields(
                { name: '⏱️ Uptime', value: `${hrs}h ${mins}m`, inline: true },
                { name: '⚡ Latency', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true },
                { name: '🧠 RAM Usage', value: `${memoryUsage} MB`, inline: true },
                { name: '🏠 OS', value: `Linux (Railway)`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [statsEmbed] });
    },
};
