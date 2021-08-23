const { MongoClient } = require('mongodb');
const config = require('./../../config.json');

function addVoiceRecord(guildId, userId, time) {
    MongoClient.connect(config.mongodb.url, function(err, db) {
        if (err) console.log(err);
        let dbo = db.db(config.mongodb.db);
        
        dbo.listCollections({ name: guildId })
            .next(function (err, collinfo ) {
                if (err) console.log(err);
                if (!collinfo) {
                    dbo.createCollection(guildId, function (err, res) {
                        if (err) console.log(err);
                        res.findOneAndUpdate({ user_id: userId }, {
                            $inc: {
                                total_user_voice_minutes: time
                            }
                        }, {upsert: true});

                        res.findOneAndUpdate({ serviceRecord: true }, {
                            $inc: {
                                total_server_voice_minutes: time
                            }
                        }, {upsert: true});
                    });
                } else {
                    dbo.collection(guildId).findOneAndUpdate({ user_id: userId }, {
                        $inc: {
                            total_user_voice_minutes: time
                        }
                    }, {upsert: true});
                    dbo.collection(guildId).findOneAndUpdate({ serviceRecord: true }, {
                        $inc: {
                            total_server_voice_minutes: time
                        }
                    }, {upsert: true});
                }
            });
    })
}

module.exports = addVoiceRecord;