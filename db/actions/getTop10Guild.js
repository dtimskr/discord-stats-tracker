const {MongoClient} = require('mongodb');
const config = require("./../../config.json");

function getTop10Guild(guildId, callback) {
    let sortedData;
    return MongoClient.connect(config.mongodb.url, function (err, db) {
        if (err) console.log(err);
        let dbo = db.db("discord-tracker");
        let sort = { total_user_messages: -1};
        
        dbo.collection(guildId).find({}).sort(sort).toArray(function(err, data) {
            if (err) console.log(err);
            // console.log(data);
            if (data.length < 10) {
                sortedData = data.slice(0, data.length).filter(i => i.serviceRecord === undefined);
                callback(sortedData);
                db.close();
            } else {
                sortedData = data.slice(0, 10).filter(i => i.serviceRecord === undefined);
                callback(sortedData);
                db.close()
            }
        });
    });
}

module.exports = getTop10Guild;