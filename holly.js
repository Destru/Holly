const fs = require('fs');
const vm = require('vm');
vm.runInThisContext(fs.readFileSync(__dirname + "/source.js"));

const discord = require('discord.js');
const client = new discord.Client({ autoReconnect: true });

const binaerpilot = 'ʙɪɴᴀᴇʀᴩɪʟᴏᴛ <:binaerpilot:439812074668032000>';
const drinks = [':beer:', ':tropical_drink:', ':cocktail:', ':wine_glass:', ':tumbler_glass:'];
const games = ['Back to Reality', 'Better Than Life', 'Gunmen of the Apocalypse', 'Play-by-mail Chess'];
const limited_access = 'Please note that access is limited (see `!support` for more information)';

client.on('ready', () => {
  const channel = client.channels.get('832036705766604830');
  let playingMsg = games[Math.floor(Math.random() * (0, games.length))];

  client.user.setPresence({game: {name: playingMsg, type: 0 }});
  channel.send('Reboot detected...');
});

client.on('message', message => {
  let command = message.content.toLowerCase();

  if (command === '!help') {
    message.channel.send(`Please check pinned messages for help, ${message.author}`);
  }

  else if (command === '!torrent' || command === '!binaerpilot') {
    message.channel.send(`${binaerpilot} Discography torrent is pinned in the <#831582407496957983> channel, ${message.author}`);
  }

  else if (command === '!developer' || command === '!hacker' || command === '!engineer' || command === '!support') {
    message.channel.send(`You can support the ***Cyberpunk Social Club*** on Patreon to unlock special roles, ${message.author}`);
    message.channel.send('https://www.patreon.com/destru');
  }

  else if (command === '!backstage') {
    message.channel.send(`${binaerpilot} Backstage torrent is pinned in the <#831769969095344128> channel, ${message.author}`);
    message.channel.send(limited_access);
  }

  else if (command === '!flac') {
    message.channel.send(`${binaerpilot} FLAC torrent is pinned in the <#831769762518007839> channel, ${message.author}`);
    message.channel.send(limited_access);
  }

  else if (command === '!drink') {
    message.channel.send(`Enjoy, ${message.author}`);
    message.channel.send(drinks[Math.floor(Math.random() * (0, drinks.length))]);
  }
});

client.login(TOKEN);
