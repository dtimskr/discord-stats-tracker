'use strict';

const Discord = require('discord.js');

exports.info = {
    command: 'rank',
    help: {
        command: 'rank',
        description: 'get your stats',
        category: 'stats'
    }
};
 
exports.function = async (parameters) => {
    const args = parameters.args;
    const message = parameters.message;
    const prefix = parameters.prefix;
    
};