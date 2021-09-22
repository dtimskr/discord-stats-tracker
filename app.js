//verison 0.1 beta
const fs = require('fs');
const path = require('path');
const { Client, Intents } = require('discord.js');

// Config
require('dotenv').config();

// Utils
const convertToMinutes = require('./utils/convertToMinutes');

// MongoDB
const { MongoClient } = require('mongodb');
const addMessageRecord = require('./db/record/addMessageRecord');
const addVoiceRecord = require('./db/record/addVoiceRecord');

// Winston
const logger = require('./log/logger.js');

// Commands framework
const commandsFilenames = fs.readdirSync(path.join(__dirname, 'commands'));
const commands = [];

for(const commandFilename of commandsFilenames) {
    const command = require(path.join(__dirname, 'commands', commandFilename));
    commands.push(command);
}


function arraySort(array) {
    return array.sort(function(a, b) {return parseFloat(b.total_user_messages) - parseFloat(a.total_user_messages);});
}

function checkUserTag(userId, callback) {
    let thanos = client.users.fetch(userId);
    thanos.then(function (result) {
        callback(result.tag);
    });
}

// Test connection to database
MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
    if (err)  {
        return logger.log('error', `MongoDB connection error`, {
            "err": err
        });
    }
    db.db().command({'isMaster': 1}, function(err, result) {
        if (err) console.log(err);
        logger.log('info', `MongoDB connected succesfully`, {
            "hosts": result.hosts
        });
        db.close();
    });
})

// Discord.JS client settings
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES]
})

client.once("ready", async () => {
    logger.log('info', "Discord connected succesfully", {
        "bot_tag": client.user.tag
    });
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    let guildId = message.guild.id;
    let userId = message.member.id;

    if (!message.content.startsWith(process.env.DISCORD_PREFIX)) {
        addMessageRecord(guildId, userId);
    }
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    const prefix = process.env.DISCORD_PREFIX;
    const args = message.content.toLowerCase().trim().split(/\s+/);
    const command = commands.find(command => prefix + command.info.command === args[0]);

    if (command) {
        const parameters = {
            args,
            command,
            message,
            prefix,
            client
        }

        command.function(parameters).then(() => {

        }).catch(e => {
            console.log(e);
            message.channel.send(e);
        })
    }
});

let voiceStates = [];

// Get voice status
client.on('voiceStateUpdate', (oldState, newState) => {
    let { guild, member } = oldState;

    // User joins a voice channel
    if (!oldState.channel) {
        voiceStates[member.id] = new Date();
        
    // User leaves voice channel
    } else if (!newState.channel) {
        let now = new Date();
        let joined = voiceStates[member.id] || new Date();

        let dateDiff = now.getTime() - joined.getTime();
        let minutes = convertToMinutes(dateDiff);

        let roundedMinutes = Math.round(minutes);
        // If time is over 1 minute then count to database ranking
        if (roundedMinutes >= 1) {
            addVoiceRecord(guild.id, member.id, roundedMinutes);
        }
    }
})

client.login(process.env.DISCORD_TOKEN);