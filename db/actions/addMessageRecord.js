const mongoose = require('mongoose');

function addMessageRecord(guildId, userInfo) {
    mongoose.connection.db.listCollections({name: guildId})
        .next(function (err, collinfo) {
            if (err) console.log(err);
            if (collinfo) {
                console.log(collinfo);
                mongoose.connection.db.collection(guildId, function (err, collection) {
                    collection.findOneAndUpdate({ user_id: userInfo.id}, {
                        $inc: {
                            total_messages: 1
                        }
                    }, {upsert: true}, function (err, doc) {
                        if (err) console.log(err);
                        console.log(doc);
                    })
                    collection.findOneAndUpdate({ serviceRecord: true }, {
                        $inc: {
                            total_server_messages: 1
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
                            if (err) console.log(err);
                            coll.findOneAndUpdate({ user_id: userInfo.id}, {
                                $inc: {
                                    total_messages: 1
                                }
                            }, {upsert: true}, function (err, doc) {
                                if (err) console.log(err);
                                console.log(doc);
                            })
                            coll.findOneAndUpdate({ serviceRecord: true }, {
                                $inc: {
                                    total_server_messages: 1
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

module.exports = addMessageRecord;