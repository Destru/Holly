const fs = require('fs');
const vm = require('vm');
vm.runInThisContext(fs.readFileSync(__dirname + "/source.js"));

const discord = require('discord.js');
const client = new discord.Client({ autoReconnect: true });
const games = ['Back to Reality', 'Better Than Life', 'Gunmen of the Apocalypse', 'Play-by-mail Chess'];

client.on('ready', () => {
  let playingMsg = games[Math.floor(Math.random() * (0, games.length))];
  client.user.setPresence({game: {name: playingMsg, type: 0 }});
});

client.on('message', message => {
  let command = message.content.toLowerCase();
  if (command === '!hello') {
    message.channel.send(`Hello, komrade ${message.author}.`);
  }
});

client.login(TOKEN);
