const http = require('http');

// This keeps Railway from killing your bot
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running!');
}).listen(process.env.PORT || 8080);

console.log("⚓ Railway Health Check initialized.");

const axios = require('axios');

// Example function to call Verba's API
async function callVerba(input) {
    try {
        const response = await axios.post('https://verba.ink/api/v1/process', {
            text: input
        }, {
            headers: {
                // This 'Authorization' header is where your key actually goes
                'Authorization': `Bearer ${process.env.VERBA_API_KEY}`
            }
        });
        return response.data;
    } catch (err) {
        console.error("Verba API Error:", err.response?.data || err.message);
    }
}
