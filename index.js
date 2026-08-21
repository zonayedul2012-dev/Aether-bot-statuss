const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const { status } = require("minecraft-server-util");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const HOST = "play4.eternalzero.cloud";
const PORT = 26659;
const CHANNEL_ID = "1539570167212675172";

let lastOnline = null;
let lastPlayers = new Set();

async function checkServer() {
  const channel = await client.channels.fetch(CHANNEL_ID);

  try {
    const result = await status(HOST, PORT, {
      timeout: 5000
    });

    const online = result.players.online;
    const max = result.players.max;

    const players = new Set(
      (result.players.sample || []).map(player => player.name)
    );

    // Server came online
    if (lastOnline === false) {
      await channel.send(`🟢 **Server Online**\n${online}/${max} players online.`);
    }

    // Server was already online
    if (lastOnline === true) {
      for (const player of players) {
        if (!lastPlayers.has(player)) {
          await channel.send(`🟢 **${player} joined**`);
        }
      }

      for (const player of lastPlayers) {
        if (!players.has(player)) {
          await channel.send(`🔴 **${player} left**`);
        }
      }
    }

    lastPlayers = players;
    lastOnline = true;

    console.log(`ONLINE — ${online}/${max}`);

  } catch {
    if (lastOnline === true) {
      await channel.send(`🔴 **Server Offline**`);
    }

    lastPlayers = new Set();
    lastOnline = false;

    console.log("OFFLINE");
  }
}

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);

  checkServer();
  setInterval(checkServer, 15000);
});

client.login(process.env.DISCORD_TOKEN);
