'use strict';

const Discord = require('discord.js');

exports.info = {
    command: 'say',
    help: {
        command: 'say <text>',
        description: 'echo',
        category: 'admin'
    }
}

exports.function = async (parameters) => {
    const args = parameters.args;
    const message = parameters.message;
    const question = args.slice(1).join(' ');
    const prefix = parameters.prefix;

    if (!question) {
        await message.reply('brak tekstu');
    } {
        await message.channel.send(question)
    }
}