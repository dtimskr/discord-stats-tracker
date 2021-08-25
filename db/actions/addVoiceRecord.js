const { MongoClient } = require('mongodb');
const logger = require('./../../log/logger.js');
const config = require('./../../config.json');

function addVoiceRecord(guildId, userId, time) {
    MongoClient.connect(config.mongodb.url, function(err, db) {
        if (err) logger.log('error', 'addVoiceRecord: MongoDB connection error', {error: err});
        let dbo = db.db(config.mongodb.db);
        
        dbo.listCollections({ name: guildId })
            .next(function (err, collinfo ) {
                if (err) logger.log('error', 'addVoiceRecord: MongoDB listCollections error', {error: err});
                if (!collinfo) {
                    dbo.createCollection(guildId, function (err, res) {
                        if (err) logger.log('error', 'addVoiceRecord: MongoDB createCollection error', {error: err, guildId: guildId});
                        res.findOneAndUpdate({ user_id: userId }, {
                            $inc: {
                                total_user_voice_minutes: time
                            }
                        }, {upsert: true}).then(() => {
                            logger.log('info', 'addVoiceRecord: user record updated succesfully', {guildId: guildId, userId: userId});
                        });

                        res.findOneAndUpdate({ serviceRecord: true }, {
                            $inc: {
                                total_server_voice_minutes: time
                            }
                        }, {upsert: true}).then(() => {
                            logger.log('info', 'addVoiceRecord: guild record updated succesfully', {guildId: guildId, userId: userId});
                        })
                    });
                } else {
                    dbo.collection(guildId).findOneAndUpdate({ user_id: userId }, {
                        $inc: {
                            total_user_voice_minutes: time
                        }
                    }, {upsert: true}).then(() => {
                        logger.log('info', 'addVoiceRecord: user record updated succesfully', {guildId: guildId, userId: userId});
                    });
                    dbo.collection(guildId).findOneAndUpdate({ serviceRecord: true }, {
                        $inc: {
                            total_server_voice_minutes: time
                        }
                    }, {upsert: true}).then(() => {
                        logger.log('info', 'addVoiceRecord: guild record updated succesfully', {guildId: guildId, userId: userId});
                    })
                }
            });
    })
}

module.exports = addVoiceRecord;