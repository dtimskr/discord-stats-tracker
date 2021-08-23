//verison 0.1 beta
const { Client, Intents, MessageEmbed } = require('discord.js');
const { MongoClient } = require('mongodb');

const config = require("./config.json");
const addMessageRecord = require('./db/actions/addMessageRecord');
const addVoiceRecord = require('./db/actions/addVoiceRecord');
const getTop10Guild = require('./db/actions/getTop10Guild');

function convertToMinutes(millis) {
    var minutes = Math.floor(millis / 60000);
    return minutes;
}

function printProgress(progress){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress + 's');
}

// Test connection to database
MongoClient.connect(config.mongodb.url, function(err, db) {
    if (err)  {
        return console.log("MongoDB connection error: " + err);
    }
    console.log(`MongoDB connection test passed!`);
    db.close();
})

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES]
})

client.once("ready", async () => {
    console.log(client.user.tag + " | ready");
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    let guildId = message.guild.id;
    let userId = message.member.id;

    // console.log(`adding to statistic record (user: ${message.member.id} | guild: ${message.guild.name} (${message.guild.id})`)
    addMessageRecord(guildId, userId)
})

let voiceStates = [];

client.on('voiceStateUpdate', (oldState, newState) => {
    //ID usera, serwer i dane użytkownika
    let { guild, member } = oldState;
    let newChannel = newState.channel;
    
    //Użytkownik dołączył do kanału
    if (!oldState.channel) {
        voiceStates[member.id] = new Date();
        console.log(`${member.user.tag} | ${guild.name} (${guild.id}) | joined to ${newChannel.name} (${newChannel.id}))`);
    //Użytkownik opuścił kanał
    } else if (!newState.channel) {
        let now = new Date();
        let joined = voiceStates[member.id] || new Date();

        let dateDiff = now.getTime() - joined.getTime();
        let minutes = convertToMinutes(dateDiff);

        let roundedMinutes = Math.round(minutes);
        //Jeżeli czas jest większy od minuty DO STH..
        if (roundedMinutes >= 1) {
            console.log(`${member.user.tag} | ${guild.name} (${guild.id}) | disconnected | time: ${roundedMinutes}`);
            addVoiceRecord(guild.id, member.id, roundedMinutes).then(() => {
                console.log(`fire | added voice record to user ${member.id} (guild: ${guild.id})`)
            })
        }
    }
})

client.login(config.discord.token)