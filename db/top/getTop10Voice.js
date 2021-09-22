const { MongoClient } = require('mongodb');
// const config = require("./../../config.json");
const logger = require("../../log/logger");

function getTop10Voice(guildId, callback) {
    let sortedData;
    MongoClient.connect(process.env.MONGODB_URL, function (err, db) {
        if (err) return logger.log('error', 'getTop10Voice: MongoDB connection error', {guildId: guildId, error: err});
        let dbo = db.db(process.env.MONGODB_DB);

        let sort = { total_user_voice_minutes: -1};
        let response = [];

        dbo.collection(guildId).find({}).sort(sort).toArray(function(err, data) {
            if (err) logger.log('error', 'getTop10Voice: MongoDB collection find/sort error', {error: err});
            // console.log(data);
            if (data.length < 10) {
                sortedData = data.slice(0, data.length).filter(i => i.serviceRecord === undefined);
                sortedData.forEach(i => {
                    let obj = {
                        user_id: i.user_id,
                        total_user_voice_minutes: i.total_user_voice_minutes
                    }
                    response.push(obj);
                });
                logger.log('info', 'getTop10Voice: sending response', {res: response});
                callback(response);
                db.close();
            } else {
                sortedData = data.slice(0, 10).filter(i => i.serviceRecord === undefined);
                sortedData.forEach(i => {
                    let obj = {
                        user_id: i.user_id,
                        top_user_voice_minutes: i.total_user_voice_minutes
                    }
                    response.push(obj);
                });
                logger.log('info', 'getTop10Voice: sending response', {res: response});
                callback(response);
                db.close()
            }
        });
    });
}

module.exports = getTop10Voice;