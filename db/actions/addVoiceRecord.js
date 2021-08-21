const mongoose = require('mongoose');

function addVoiceRecord(guildId, userInfo, time) {
    mongoose.connection.db.listCollections({name: guildId})
        .next(function (err, collinfo) {
            if (err) console.log(err);
            if (collinfo) {
                console.log(collinfo);
                mongoose.connection.db.collection(guildId, function (err, collection) {
                    collection.findOneAndUpdate({ user_id: userInfo.id}, {
                        $inc: {
                            total_user_voice_minutes: time
                        }
                    }, {upsert: true}, function (err, doc) {
                        if (err) console.log(err);
                        console.log(doc);
                    })
                    collection.findOneAndUpdate({ serviceRecord: true }, {
                        $inc: {
                            total_server_voice_minutes: time
                        }
                    }, {upsert: true}, function (err, doc) {
                        if (err) console.log(err);
                        console.log(doc);
                    })
                });

            } else {
                mongoose.connection.db.createCollection({name: guildId})
                    .then(function (err, collection) {
                        if (err) console.log(err);
                        collection(guildId, function (err, coll) {
                            coll.findOneAndUpdate({ user_id: userInfo.id}, {
                                $inc: {
                                    total_user_voice_minutes: time
                                }
                            }, {upsert: true}, function (err, doc) {
                                if (err) console.log(err);
                                console.log(doc);
                            })
                            coll.findOneAndUpdate({ serviceRecord: true }, {
                                $inc: {
                                    total_server_voice_minutes: time
                                }
                            }, {upsert: true}, function (err, doc) {
                                if (err) console.log(err);
                                console.log(doc);
                            })
                        });
                    });
            }
        });
}

module.exports = addVoiceRecord;