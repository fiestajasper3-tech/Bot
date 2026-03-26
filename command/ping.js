const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Checks the bot latency'),
    async execute(interaction) {
        // Calculate the round-trip latency
        const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        
        await interaction.editReply(`🏓 Pong! \n**Latency:** ${latency}ms\n**API Latency:** ${Math.round(interaction.client.ws.ping)}ms`);
    },
};
