const { MongoClient } = require('mongodb');
const { Client } = require('discord.js');
const fetch = require('node-fetch');
const config = require("./../../config.json");

function getTop10Guild(guildId, callback) {
    let sortedData;
    return MongoClient.connect(config.mongodb.url, function (err, db) {
        if (err) console.log(err);
        let dbo = db.db("discord-tracker");
        let sort = { total_user_messages: -1};
        let response = [];
        dbo.collection(guildId).find({}).sort(sort).toArray(function(err, data) {
            if (err) console.log(err);
            // console.log(data);
            if (data.length < 10) {
                sortedData = data.slice(0, data.length).filter(i => i.serviceRecord === undefined);
                sortedData.forEach(i => {
                    console.log(i.user_id);
                    let obj = {
                        user_id: i.user_id,
                        total_user_messages: i.total_user_messages
                    }
                    response.push(obj);
                });
                callback(response);
                db.close();
            } else {
                sortedData = data.slice(0, 10).filter(i => i.serviceRecord === undefined);
                sortedData.forEach(i => {
                    let obj = {
                        user_id: i.user_id,
                        total_user_messages: i.total_user_messages
                    }
                    response.push(obj);
                });
                callback(response);
                db.close()
            }
        });
    });
}

module.exports = getTop10Guild;