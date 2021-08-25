const { MongoClient } = require('mongodb');
const logger = require('./../../log/logger.js');
const config = require('./../../config.json');


/**
 * @param  {number} guildId - Discord guild Id
 * @param  {number} userId - Discord user Id
 */
function addMessageRecord (guildId, userId, callback) {
    MongoClient.connect(config.mongodb.url, function (err, db) {
        if (err) logger.log('error', 'addMessageRecord: mongoDB connection error}', { error: err });
        let dbo = db.db(config.mongodb.db);

        dbo.listCollections({ name: guildId })
            .next(function (err, collinfo) {
                if (err) logger.log('error', 'addMessageRecord: MongoDB listCollections error', {error: err});
                if (!collinfo) {
                    dbo.createCollection(guildId, function (err, res) {
                        if (err) logger.log('error', 'addMessageRecord: create collection error}', { guildId: guildId, error: err });
                        logger.log('info', "addMessageRecord: create collection done", { guild_id: guildId });
                        res.findOneAndUpdate({ user_id: userId }, {
                            $inc: {
                                total_user_messages: 1
                            }
                        }, { upsert: true }).then(() => {
                            logger.log('info', 'addMessageRecord: user record updated',{guildId: guildId, userId: userId});
                        });

                        res.findOneAndUpdate({ serviceRecord: true }, {
                            $inc: {
                                total_server_messages: 1
                            }
                        }, { upsert: true }).then(() => {
                            logger.log('info', 'addMessageRecord: guild record updated', {guildId: guildId});
                        })
                    });
                } else {
                    dbo.collection(guildId).findOneAndUpdate({ user_id: userId }, {
                        $inc: {
                            total_user_messages: 1
                        }
                    }, { upsert: true }).then(() => {
                        logger.log('info', 'addMessageRecord: user record updated',{guildId: guildId, userId: userId});
                    });
                    dbo.collection(guildId).findOneAndUpdate({ serviceRecord: true }, {
                        $inc: {
                            total_server_messages: 1
                        }
                    }, { upsert: true }).then(() => {
                        logger.log('info', 'addMessageRecord: guild record updated', {guildId: guildId});
                    })
                }
            });
    })
}

module.exports = addMessageRecord;