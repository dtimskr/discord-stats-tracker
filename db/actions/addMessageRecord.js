const { MongoClient } = require('mongodb');
const config = require('./../../config.json');

/**
 * @param  {number} guildId - Discord guild Id
 * @param  {number} userId - Discord user Id
 */
function addMessageRecord (guildId, userId) {
    MongoClient.connect(config.mongodb.url, function (err, db) {
        if (err)
            console.log(err);
        let dbo = db.db(config.mongodb.db);

        dbo.listCollections({ name: guildId })
            .next(function (err, collinfo) {
                if (err)
                    console.log(err);
                if (!collinfo) {
                    dbo.createCollection(guildId, function (err, res) {
                        if (err) console.log(err);
                        console.log(`${new Date().toUTCString()} | LOG | New collection for guild (${guildId}) created`)
                        res.findOneAndUpdate({ user_id: userId }, {
                            $inc: {
                                total_user_messages: 1
                            }
                        }, { upsert: true }).then(() => {
                            console.log(`${new Date().toUTCString()} | LOG | User (${userId} / ${guildId}) total messages record added to database`)
                        });

                        res.findOneAndUpdate({ serviceRecord: true }, {
                            $inc: {
                                total_server_messages: 1
                            }
                        }, { upsert: true }).then(() => {
                            console.log(`${new Date().toUTCString()} | LOG | Guild (${guildId})total messages record added to database`)
                        })
                    });
                } else {
                    dbo.collection(guildId).findOneAndUpdate({ user_id: userId }, {
                        $inc: {
                            total_user_messages: 1
                        }
                    }, { upsert: true }).then(() => {
                        console.log(`${new Date().toUTCString()} | LOG | User (${userId} / ${guildId}) total messages record added to database`)
                    });
                    dbo.collection(guildId).findOneAndUpdate({ serviceRecord: true }, {
                        $inc: {
                            total_server_messages: 1
                        }
                    }, { upsert: true }).then(() => {
                        console.log(`${new Date().toUTCString()} | LOG | Guild (${guildId}) total messages record added to database }`);
                    })
                }
            });
    })
}

module.exports = addMessageRecord;