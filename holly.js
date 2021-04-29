const fs = require('fs');
const vm = require('vm');
vm.runInThisContext(fs.readFileSync(__dirname + "/source.js"));

const discord = require('discord.js');
const client = new discord.Client({ autoReconnect: true });

const drinks = [':beer:', ':tropical_drink:', ':cocktail:', ':wine_glass:', ':tumbler_glass:'];
const games = ['Back to Reality', 'Better Than Life', 'Gunmen of the Apocalypse', 'Play-by-mail Chess'];

client.on('ready', () => {
  let playingMsg = games[Math.floor(Math.random() * (0, games.length))];
  client.user.setPresence({game: {name: playingMsg, type: 0 }});
});

client.on('message', message => {
  let command = message.content.toLowerCase();

  if (command === '!help') {
    message.channel.send(`Please check pinned messages for help, ${message.author}`);
  }

  else if (command === '!drink') {
    message.channel.send(`Enjoy, ${message.author}`);
    message.channel.send(drinks[Math.floor(Math.random() * (0, drinks.length))]);
  }
});

client.login(TOKEN);
