require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
const status = ['Back to Reality', 'Better Than Life', 'Gunmen of the Apocalypse', 'Play-by-mail Chess'];

client.on('ready', () => {
  console.log(`Holly is playing ${status[Math.floor(Math.random() * status.length)]}`);
});

client.login();
