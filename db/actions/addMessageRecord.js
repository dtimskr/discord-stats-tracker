const { MongoClient } = require('mongodb');
const logger = require('./../../log/logger.js');
// const config = require('./../../config.json');
// require('dotenv').config();

/**
 * @param  {string} guildId - Discord guild Id
 * @param  {string} userId - Discord user Id
 */
function addMessageRecord(guildId, userId) {
    MongoClient.connect(process.env.MONGODB_URL, function (err, db) {
        if (err) logger.log('error', 'addMessageRecord: mongoDB connection error}', { error: err });
        let dbo = db.db(process.env.MONGODB_DB);

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
                        }, { upsert: true }).then((value) => {
                            console.log(value);
                            logger.log('info', 'addMessageRecord: user record updated',{guildId: guildId, userId: userId, id: value.value._id});
                        });

                        res.findOneAndUpdate({ serviceRecord: true }, {
                            $inc: {
                                total_server_messages: 1
                            }
                        }, { upsert: true }).then((value) => {
                            logger.log('info', 'addMessageRecord: guild record updated', {guildId: guildId, id: value.value._id});
                        })
                    });
                } else {
                    dbo.collection(guildId).findOneAndUpdate({ user_id: userId }, {
                        $inc: {
                            total_user_messages: 1
                        }
                    }, { upsert: true }).then((value) => {
                        logger.log('info', 'addMessageRecord: user record updated',{guildId: guildId, userId: userId, id: value.value._id});
                    });

                    dbo.collection(guildId).findOneAndUpdate({ serviceRecord: true }, {
                        $inc: {
                            total_server_messages: 1
                        }
                    }, { upsert: true }).then((value) => {
                        logger.log('info', 'addMessageRecord: guild record updated', {guildId: guildId, id: value.value._id});
                    })
                }
            });
    })
}

module.exports = addMessageRecord;