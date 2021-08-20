const { Client, Intents } = require('discord.js');
const config = require("./config.json");

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES]
})

client.once("ready", async () => {
    console.log(client.user.tag + " | ready");
});

client.login(config.discord.token)