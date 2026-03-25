const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).split(/ +/);
  const command = args.shift().toLowerCase();

  // KICK COMMAND
  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply("No permission!");
    const target = message.mentions.members.first();
    if (target) {
      await target.kick();
      message.reply(`${target.user.tag} has been kicked.`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
