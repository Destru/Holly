require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
const cron = require('node-cron');
const fetch = require('node-fetch');

const insultUsers = ['400786664861204481'];
const status = ['Back to Reality', 'Better Than Life', 'Gunmen of the Apocalypse', 'Play-by-mail Chess'];

cron.schedule('0 */4 * * *', () => {
  client.user.setPresence({
    status: 'online',
    activity: {
      name: status[(Math.floor(Math.random() * status.length))],
      type: 'PLAYING',
    }
  });
});

client.on('message', message => {
  if (insultUsers.includes(message.author.id) && Math.random() < 0.01) {
    fetch('https://insult.mattbas.org/api/insult.json')
      .then(response => response.json())
      .then(data => {
        message.channel.send(`${data.insult}, <@${config.insultUser}>`);
      });
  } else
  if (message.startsWith('!ping')) {
    message.channel.send(`${Date.now() - message.createdTimestamp}ms / ${Math.round(client.ws.ping)}ms`);
  }
});

client.on('ready', () => {
  console.log(`Holly ${process.env.npm_package_version} is online.`);
  client.user.setPresence({
    status: 'online',
    activity: {
      name: `Destru's OnlyFans`,
      type: 'WATCHING',
    }
  });
});

client.login();