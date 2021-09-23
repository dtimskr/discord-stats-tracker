'use strict';

const Discord = require('discord.js');
const { MongoClient } = require('mongodb');
const logger = require('./../log/logger');
// const getUserRank = require('../db/rank/getUserRank');

exports.info = {
    command: 'rank',
    help: {
        command: 'rank',
        description: 'get your stats',
        category: 'stats'
    }
};
 
exports.function = async (parameters) => {
    const args = parameters.args;
    const message = parameters.message;
    const prefix = parameters.prefix;
    let guildId = message.guild.id;
    let userId = message.author.id;

    let statsObj = {
        guildid: guildId,
        userid: userId,
        messages: {
            ranking: null,
            total: null
        },
        voice: {
            ranking: null,
            total: null
        }
    };

    MongoClient.connect(process.env.MONGODB_URL, async function (err, db) {
        if (err) logger.log('error', 'commands/rank.js: mongoDB connection error}', { error: err });

        let dbo = db.db(process.env.MONGODB_DATABASE);

        dbo.collection(message.guild.id).aggregate([
            {
                "$sort": { "total_user_messages": -1 }
            },
            {
                "$group": {
                    "_id": false,
                    "users": { "$push": { "_id": "$_id", "user_id": "$user_id", "total_user_messages": "$total_user_messages" } }
                }
            },
            {
                "$unwind": { "path": "$users", "includeArrayIndex": "ranking" }
            },
            {
                "$match": {
                    "users.user_id": userId
                }
            }
        ]).toArray(function (err, data) {
            if (err) logger.log('error', 'commands/rank.js: messages aggregate.toArray error', { error: err });
            let ranking = data[0].ranking + 1;
            let totalMessages = data[0].users.total_user_messages;

            statsObj.messages.ranking = ranking;
            statsObj.messages.total = totalMessages;
            dbo.collection(message.guild.id).aggregate([
                {
                    "$sort": { "total_user_voice_minutes": -1 }
                },
                {
                    "$group": {
                        "_id": false,
                        "users": { "$push": { "_id": "$_id", "user_id": "$user_id", "total_user_voice_minutes": "$total_user_voice_minutes" } }
                    }
                },
                {
                    "$unwind": { "path": "$users", "includeArrayIndex": "ranking" }
                },
                {
                    "$match": {
                        "users.user_id": userId
                    }
                }
            ]).toArray(async function (err, voiceData) {
                if (err) logger.log('error', 'commands/rank.js: voice aggregate.toArray error', { error: err });
                statsObj.voice.ranking = voiceData[0].ranking + 1;
                statsObj.voice.total = voiceData[0].users.total_user_voice_minutes;
                logger.log('info', 'commands/rank.js: sending ranking data', statsObj)
                const embed = {
                    "title": `${message.author.tag}'s stats`,
                    "color": 11895409,
                    "timestamp": new Date(),
                    "footer": {
                      "text": "github.com/@dtimskr/discord-stats-tracker"
                    },
                    "author": {
                      "icon_url": message.author.avatarURL
                    },
                    "fields": [
                      {
                        "name": "Messages",
                        "value": `#${statsObj.messages.ranking} with ${statsObj.messages.total} messages`
                      },
                      {
                        "name": "Voice Chat",
                        "value": `#${statsObj.voice.ranking} with ${statsObj.voice.total} minutes on voice chat`
                      }
                    ]
                  };
                message.channel.send({embeds: [embed]});
                db.close();
            });
        });
    });

};