//verison 0.1 beta
const { Client, Intents, UserFlags } = require('discord.js');
const { MongoClient } = require('mongodb');

const config = require("./config.json");
const addMessageRecord = require('./db/actions/addMessageRecord');
const addVoiceRecord = require('./db/actions/addVoiceRecord');

function convertToMinutes(millis) {
    var minutes = Math.floor(millis / 60000);
    return minutes;
}

function printProgress(progress){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress + 's');
}

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES]
})

client.once("ready", async () => {
    console.log(client.user.tag + " | ready");
});

client.on("message", async (message) => {
    let guildId = message.guild.id;
    let userId = message.member.id;

    console.log(`adding to statistic record (user: ${message.member.id} | guild: ${message.guild.name} (${message.guild.id})`)
    addMessageRecord(guildId, userId);
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

        if (minutes > 1) {
            Math.round(minutes)
        }
        //Jeżeli czas jest większy od minuty DO STH..
        if (minutes >= 1) {
            
            //TODO
            // 1. Wysłanie +1 do całkowitej ilości minut na serwerze
            // 2. Wysłanie +1 do indywidualnych statystyk użytkownika
            console.log(`${member.user.tag} | ${guild.name} (${guild.id}) | disconnected | time: ${convertToMinutes(dateDiff)}`);
            addVoiceRecord(guild.id, member.id, minutes);
        }
    }
})

client.login(config.discord.token)