//verison 0.1 beta
const { Client, Intents, MessageEmbed } = require('discord.js');
const { MongoClient } = require('mongodb');
const { createLogger, format, transports } = require('winston');

const config = require("./config.json");
const addMessageRecord = require('./db/actions/addMessageRecord');
const addVoiceRecord = require('./db/actions/addVoiceRecord');
const getTop10Guild = require('./db/actions/getTop10Guild');


const logger = createLogger({
    format: format.combine(
        format.splat(),
        format.simple()
      ),
    transports: [new transports.Console()]
})

function arraySort(array) {
    return array.sort(function(a, b) {return parseFloat(b.total_user_messages) - parseFloat(a.total_user_messages);});
}

function checkUserTag(userId, callback) {
    let thanos = client.users.fetch(userId);
    thanos.then(function (result) {
        callback(result.tag);
    });
}

function convertToMinutes(millis) {
    var minutes = Math.floor(millis / 60000);
    return minutes;
}

// Test connection to database
MongoClient.connect(config.mongodb.url, function(err, db) {
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

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES]
})

client.once("ready", async () => {
    logger.log('info', "Discord connected succesfully", {
        "bot_tag": client.user.tag
    })
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    let guildId = message.guild.id;
    let userId = message.member.id;

    let newData = [];
    let statsMessage = "Top 10 users\n";

    if (message.content === "fire top10") {
        getTop10Guild(guildId, (result) => {
            result.forEach(i => {
                checkUserTag(i.user_id, function(userData) {
                    let newObj = {
                        user_id: i.user_id,
                        user_tag: userData,
                        total_user_messages: i.total_user_messages
                    }
                    newData.push(newObj);

                    if (newData.length === result.length) {
                        let finallyCounter = 0;
                        let sortedData = arraySort(newData);

                        sortedData.forEach(i => {
                            statsMessage = statsMessage + `${i.user_tag} - ${i.total_user_messages} messages\n`;
                            finallyCounter = finallyCounter + 1;

                            if (sortedData.length === finallyCounter) {
                                return message.channel.send(statsMessage)
                            }
                        })
                    };
                });
            })
        });
    }

    addMessageRecord(guildId, userId);
});

let voiceStates = [];

client.on('voiceStateUpdate', (oldState, newState) => {
    //ID usera, serwer i dane użytkownika
    let { guild, member } = oldState;
    let newChannel = newState.channel;
    
    //Użytkownik dołączył do kanału
    if (!oldState.channel) {
        voiceStates[member.id] = new Date();
        
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

client.login(config.discord.token);