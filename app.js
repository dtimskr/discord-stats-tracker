const { Client, Intents } = require('discord.js');
const { MongoClient } = require("mongodb");

const config = require("./config.json");

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES]
})

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000))
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);
    
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    
    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    }

client.once("ready", async () => {
    console.log(client.user.tag + " | ready");
});

client.on("message", async (message) => {
    //podlaczenie do mongodb
    MongoClient.connect(config.mongodb.url, function(err, db) {
        if (err) throw err;

        let dbo = db.db(config.mongodb.db);
        
        //Sprawdzanie czy istnieje collection dla danego serwera
        dbo.listCollections({name: message.guild.id})
            .next(function(err, collinfo) {
                //Jeżeli istnieje do sth...
                // TODO
                // 1. Dodanie +1 do total messages serwera
                // 2. Dodanie +1 do indywidualnych statystyk użytkownika
                if (collinfo) {
                    console.log(`Collection for guild ${message.guild.name} (id: ${message.guild.id}) exists`);
                } else {
                    dbo.createCollection(message.guild.id, function(err, res) {
                        if (err) throw console.log(err);
                        console.log(`Collection for guild ${message.guild.name} (id: ${message.guild.id}) created`);
                    })
                }
            });
        
    })
})

let voiceStates = [];

client.on('voiceStateUpdate', (oldState, newState) => {
    //ID usera, serwer i dane użytkownika
    let { guild, member } = oldState;
    let newChannel = newState.channel;
    
    //Użytkownik dołączył do kanału
    if (!oldState.channel) {
        voiceStates[member.id] = new Date();
        console.log(`${member.user.tag} | ${guild.name} (${guild.id}) | joined to ${newChannel.name} (${newChannel.id})`);
    //Użytkownik opuścił kanał
    } else if (!newState.channel) {
        let now = new Date();
        let joined = voiceStates[member.id] || new Date();

        let dateDiff = now.getTime() - joined.getTime();
        //Jeżeli czas jest większy od minuty DO STH..
        if (dateDiff > 60 * 1000) {
            //TODO
            // 1. Wysłanie +1 do całkowitej ilości minut na serwerze
            // 2. Wysłanie +1 do indywidualnych statystyk użytkownika
            console.log(`${member.user.tag} | ${guild.name} (${guild.id}) | disconnected | time: ${msToTime(dateDiff)}`);
        }
    }
})

client.login(config.discord.token)