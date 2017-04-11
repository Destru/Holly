var fs = require("fs"); var vm = require('vm'); vm.runInThisContext(fs.readFileSync(__dirname + "/source.js"));
// </safekeeping>

const Discord = require('discord.js');
const Spotify = require('node-spotify-webhelper');

const bot = new Discord.Client({ autoReconnect: true });
const spotify = new Spotify.SpotifyWebHelper();

bot.on('ready', () => {
  console.log('Holly is online!');
});

bot.on('guildMemberAdd', member => {
  const channel = client.channels.get(CHAT_GENERAL);
  channel.sendMessage(`Welcome to the Cyberpunk Social Club, ${member}!`);
});

bot.on('message', message => {
  if (message.content === '!playing') {
    var msg = `Nothing playing on Spotify right now, ${message.author.username}.`;

    spotify.getStatus(function (err, res) {
      if (err) {
        return console.error(err);
      }

      else if (res.error === 'undefined') {
        msg = `${res.track.artist_resource.name} — ${res.track.track_resource.name}`;
      }

      message.channel.sendMessage(msg);
    });
  }

  else if (message.content === '!torrent') {
    message.author.sendFile(TORRENT,
      'Binaerpilot Discography.torrent',
      DOWNLOAD_TEXT + 'Binaerpilot Discography.');
  }

  else if (message.content === '!backstage') {
    if (message.member.roles.has(ROLE_SCRIPTER) || message.member.roles.has(ROLE_HACKER)) {
        message.author.sendFile(TORRENT_BACKSTAGE,
          'Binaerpilot Backstage.torrent',
          DOWNLOAD_TEXT + 'Binaerpilot Backstage.');
    }
    else {
      message.channel.sendMessage(`You need to be at least a **Scripter** to access the Backstage, ${message.author.username}.`);
    }
  }

  else if (message.content === '!flac' || message.content === '!FLAC') {
    if (message.member.roles.has(ROLE_HACKER) || message.member.roles.has(ROLE_STATE)) {
        message.author.sendFile(TORRENT_FLAC,
          'Binaerpilot FLAC.torrent',
          DOWNLOAD_TEXT + 'Binaerpilot FLAC Discography.');
    }
    else {
      message.channel.sendMessage(`You need to be a **Hacker** to access the FLAC Discography, ${message.author.username}.`);
    }
  }
});

bot.login(TOKEN);
