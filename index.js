const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const http = require('http');
require('dotenv').config();

// --- 1. RAILWAY HEALTH CHECK ---
// This prevents the "Crashed" status on the Railway dashboard
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is healthy and running!');
}).listen(process.env.PORT || 8080);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// --- 2. COMMAND LOADER (Scans /commands folder) ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// --- 3. EVENT LOADER (Scans /events folder for ready.js & messageCreate.js) ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

// --- 4. THE ANTI-CRASH SYSTEM ---
// This stops the bot from dying if there is a small error in your code or API
process.on('unhandledRejection', (reason, promise) => {
    console.error(' [ANTI-CRASH] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.error(' [ANTI-CRASH] Uncaught Exception:', err, 'at:', origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.error(' [ANTI-CRASH] Exception Monitor:', err, 'at:', origin);
});

// --- 5. LOGIN ---
client.login(process.env.TOKEN);
