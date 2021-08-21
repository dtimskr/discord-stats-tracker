const mongoose = require('mongoose');
const config = require('./../config.json').mongodb;

const url = mongoose.connect(config.url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true
});
