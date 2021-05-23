require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
const cron = require('node-cron');
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
