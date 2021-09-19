const { MongoClient } = require('mongodb');
const logger = require('../../log/logger');
// const config = require("./../../config.json");

function getTop10Messages(guildId, callback) {
    let sortedData;
    MongoClient.connect(process.env.MONGODB_URL, function (err, db) {
        if (err) return logger.log('error', 'getTop10GuildMessages: MongoDB connection error', {guildId: guildId, error: err});
        let dbo = db.db(process.env.MONGODB_DB);
        let sort = { total_user_messages: -1};
        let response = [];
        dbo.collection(guildId).find({}).sort(sort).toArray(function(err, data) {
            if (err) console.log(err);
            // console.log(data);
            if (data.length < 10) {
                sortedData = data.slice(0, data.length).filter(i => i.serviceRecord === undefined);
                sortedData.forEach(i => {
                    let obj = {
                        user_id: i.user_id,
                        total_user_messages: i.total_user_messages
                    }
                    response.push(obj);
                });
                logger.log('info', 'getTop10Messages: sending response', {res: response});
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

module.exports = getTop10Messages;