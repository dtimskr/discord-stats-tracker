"use strict";

const Discord = require('discord.js');

const getTop10Messages = require('./../db/actions/getTop10Messages');
const getTop10Voice = require('./../db/actions/getTop10Voice');

function arraySort(array) {
    return array.sort(function(a, b) {return parseFloat(b.total_user_messages) - parseFloat(a.total_user_messages);});
}

function checkUserTag(message, userId, callback) {
    let thanos = message.client.users.fetch(userId);
    thanos.then(function (result) {
        callback(result.tag);
    });
}

exports.info = {
    command: 'top10',
    help: {
        command: 'top10 <(messages / msg)/voice>',
        description: 'get top10 on messages or voice chat',
        category: 'stats'
    }
};

 
exports.function = async (parameters) => {
    const args = parameters.args;
    const message = parameters.message;
    const prefix = parameters.prefix;
    const client = parameters.client;
    
    let newData = [];
    let statsMessage = "";

    if (args[1] === "messages" || args[1] === "msg") {
        getTop10Messages(message.guild.id, (result) => {
            console.log(result);
            result.forEach(i => {
                checkUserTag(message, i.user_id, function (userData) {
                    let newObj = {
                        user_id: i.user_id,
                        user_tag: userData,
                        total_user_messages: i.total_user_messages
                    };
                    newData.push(newObj);
                    

                    if (newData.length === result.length) {
                        let finallyCounter = 0;
                        let sortedData = arraySort(newData);

                        sortedData.forEach(i => {
                            statsMessage = statsMessage + `${i.user_tag} - ${i.total_user_messages}`;
                            finallyCounter = finallyCounter + 1;

                            if (sortedData.length === finallyCounter) {
                                let statsEmbed = new Discord.MessageEmbed()
                                    .setTitle("Top 10 in Messages")
                                    .setDescription(statsMessage)
                                    .setFooter('discord-stats-tracker');
                                message.channel.send({embeds: [statsEmbed]});
                            };
                        })
                    }
                });
            });
        });
    } else if (args[1] === "voice" || args[1] === "v") {
        getTop10Voice(message.guild.id, (result) => {
            result.forEach(i => {
                checkUserTag(message, i.user_id, function(userData) {
                    let newObj = {
                        user_id: i.user_id,
                        user_tag: userData,
                        total_user_voice_minutes: i.total_user_voice_minutes
                    };
                    newData.push(newObj);

                    if (newData.length === result.length) {
                        let finallyCounter = 0;
                        let sortedData = arraySort(newData);

                        sortedData.forEach(i => {
                            statsMessage = statsMessage + `${i.user_tag} - ${i.total_user_voice_minutes}`;
                            finallyCounter = finallyCounter + 1;

                            if (sortedData.length === finallyCounter) {
                                let statsEmbed = new Discord.MessageEmbed()
                                    .setTitle("Top 10 on Voice Chat")
                                    .setDescription(statsMessage)
                                    .setFooter('discord-stats-tracker');
                                message.channel.send({embeds: [statsEmbed]});
                            }
                        });
                    }
                })
            });
        });
    } else {
        return message.channel.send()
    }
};