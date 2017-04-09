const Discord = require('discord.js');
const bot = new Discord.Client({
  autoReconnect: true
});
const token = 'MzAwNTM1Njg3NTI1MTcxMjAx.C8t40g.2fx0Ds1_awaYskAqsksJUWk2cNY';

bot.on('ready', () => {
  console.log('Holly is online!');
});

var nodeSpotifyWebHelper = require('node-spotify-webhelper');
var spotify = new nodeSpotifyWebHelper.SpotifyWebHelper();

bot.on('message', message => {
  if (message.content === '!song') {
    spotify.getStatus(function (err, res) {
      if (err) {
        return console.error(err);
      }

      var songData = res.track.artist_resource.name, '-',
          res.track.track_resource.name);
    });

    message.channel.sendMessage(songData);
  }
});

bot.login(token);
