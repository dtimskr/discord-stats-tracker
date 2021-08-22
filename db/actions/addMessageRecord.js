const { MongoClient } = require('mongodb');
const config = require('./../../config.json');

function addMessageRecord(guildId, userId) {
    MongoClient.connect(config.mongodb.url, function(err, db) {
        if (err) console.log(err);
        let dbo = db.db("discord-tracker");
        
        dbo.listCollections({ name: guildId })
            .next(function (err, collinfo ) {
                if (err) console.log(err);
                if (!collinfo) {
                    dbo.createCollection(guildId, function (err, res) {
                        if (err) console.log(err);
                        res.findOneAndUpdate({ user_id: userId }, {
                            $inc: {
                                total_user_messages: 1
                            }
                        }, {upsert: true});

                        res.findOneAndUpdate({ serviceRecord: true }, {
                            $inc: {
                                total_server_messages: 1
                            }
                        }, {upsert: true});
                    });
                } else {
                    dbo.collection(guildId).findOneAndUpdate({ user_id: userId }, {
                        $inc: {
                            total_user_messages: 1
                        }
                    }, {upsert: true});
                    dbo.collection(guildId).findOneAndUpdate({ serviceRecord: true }, {
                        $inc: {
                            total_server_messages: 1
                        }
                    }, {upsert: true});
                }
            });
    })
}

module.exports = addMessageRecord;