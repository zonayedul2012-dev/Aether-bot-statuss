const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const { status } = require("minecraft-server-util");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

const HOST = "play4.eternalzero.cloud";
const PORT = 26659;

let lastOnline = false;
let lastPlayers = new Set();

async function checkServer() {
  try {
    const result = await status(HOST, PORT, {
      timeout: 5000
    });

    const players = new Set(
      (result.players.sample || []).map(p => p.name)
    );

    // Server came online
    if (!lastOnline) {
      console.log("SERVER ONLINE");
    }

    // Players who joined
    for (const player of players) {
      if (!lastPlayers.has(player)) {
        console.log(`${player} joined the server`);
      }
    }

    // Players who left
    for (const player of lastPlayers) {
      if (!players.has(player)) {
        console.log(`${player} left the server`);
      }
    }

    lastPlayers = players;
    lastOnline = true;

    console.log(
      `Online — ${result.players.online}/${result.players.max} players`
    );

  } catch (error) {
    if (lastOnline) {
      console.log("SERVER OFFLINE");
    }

    lastOnline = false;
    lastPlayers = new Set();

    console.log("Server offline");
  }
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  checkServer();
  setInterval(checkServer, 15000);
});

client.login(process.env.DISCORD_TOKEN);
