const Discord = require('discord.js');
const NodeSpotifyWebHelper = require('node-spotify-webhelper');

const bot = new Discord.Client({ autoReconnect: true });
const spotify = new NodeSpotifyWebHelper.SpotifyWebHelper();
const token = 'MzAwNTM1Njg3NTI1MTcxMjAx.C8t40g.2fx0Ds1_awaYskAqsksJUWk2cNY';

bot.on('ready', () => {
  console.log('Holly is online!');
});

bot.on('message', message => {
  if (message.content === '!playing') {
    var songData = 'Nothing playing on Spotify right now, dudes.';

    spotify.getStatus(function (err, res) {
      if (err) {
        return console.error(err);
      }

      if (res.track !== 'undefined') {
        songData = `${res.track.artist_resource.name} — ${res.track.track_resource.name}`;
      }

      message.channel.sendMessage(songData);
    });
  }
});

bot.login(token);
