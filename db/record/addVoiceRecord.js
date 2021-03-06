const { MongoClient } = require('mongodb');
const logger = require('./../../log/logger.js');

function addVoiceRecord(guildId, userId, time) {
    MongoClient.connect(process.env.MONGODB_URL, function (err, db) {
        if (err) logger.log('error', 'addVoiceRecord: MongoDB connection error', {error: err});
        let dbo = db.db(process.env.MONGODB_DB);
        
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
                        }, {upsert: true}).then((value) => {
                            logger.log('info', 'addVoiceRecord: user record updated successfully', {guildId: guildId, userId: userId, value: value.value._id});
                        });

                        res.findOneAndUpdate({ serviceRecord: true }, {
                            $inc: {
                                total_server_voice_minutes: time
                            }
                        }, {upsert: true}).then((value) => {
                            logger.log('info', 'addVoiceRecord: guild record updated successfully', {guildId: guildId, userId: userId, value: value.value._id});
                            db.close();
                        })
                    });
                } else {
                    dbo.collection(guildId).findOneAndUpdate({ user_id: userId }, {
                        $inc: {
                            total_user_voice_minutes: time
                        }
                    }, {upsert: true}).then((value) => {
                        logger.log('info', 'addVoiceRecord: user record updated successfully', {guildId: guildId, userId: userId, value: value.value._id});
                    });
                    dbo.collection(guildId).findOneAndUpdate({ serviceRecord: true }, {
                        $inc: {
                            total_server_voice_minutes: time
                        }
                    }, {upsert: true}).then((value) => {
                        logger.log('info', 'addVoiceRecord: guild record updated succesfully', {guildId: guildId, userId: userId, value: value.value._id});
                        db.close();
                    })
                }
            });
    })
}

module.exports = addVoiceRecord;