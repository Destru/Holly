var fs = require("fs"); var vm = require('vm');
vm.runInThisContext(fs.readFileSync(__dirname + "/source.js"));
// </safekeeping>

const Discord = require('discord.js');
const Spotify = require('node-spotify-webhelper');

const bot = new Discord.Client({ autoReconnect: true });
const spotify = new Spotify.SpotifyWebHelper();

bot.on('ready', () => {
  console.log('Holly is online!');
});

bot.on('guildMemberAdd', member => {
  const channel = bot.channels.get(CHAT_GENERAL);
  channel.sendMessage(`Welcome to the Cyberpunk Social Club, ${member}!`);
});

bot.on('message', message => {
  var prepMsg = `Preparing your files now, ${message.author}. Please check your messages.`;
  var spotifyMsg = `Spotify is not running right now, ${message.author}.`;

  if (message.content === '!spotify' || message.content === '!playing') {
    spotify.getStatus(function(err, res) {

      if (res.running === true && res.track !== 'undefined') {
        msg = `${res.track.artist_resource.name} — ${res.track.track_resource.name}`;
      }

      message.channel.sendMessage(spotifyMsg);
    });
  }

  else if (message.content === '!binaerpilot') {
    message.channel.sendFile(TORRENT, 'Binaerpilot_Discography.torrent');
  }

  else if (message.content === '!backstage') {
    if (message.member.roles.has(ROLE_SCRIPTER) ||
      message.member.roles.has(ROLE_HACKER) ||
      message.member.roles.has(ROLE_STATE)) {
        message.channel.sendMessage(prepMsg);
        message.author.sendFile(TORRENT_BACKSTAGE,
          'Binaerpilot_Backstage.torrent', LINK_FLAVOR_TEXT);
    }
    else {
      message.channel.sendMessage(`You need to be at least a **Scripter** to access backstage, ${message.author}.`);
    }
  }

  else if (message.content === '!flac' || message.content === '!FLAC') {
    if (message.member.roles.has(ROLE_HACKER) ||
      message.member.roles.has(ROLE_STATE)) {
        message.channel.sendMessage(prepMsg);
        message.author.sendFile(TORRENT_FLAC, 'Binaerpilot_FLAC.torrent',
          LINK_FLAVOR_TEXT);
    }
    else {
      message.channel.sendMessage(`You need to be a **Hacker** to access FLAC, ${message.author}.`);
    }
  }
});

bot.login(TOKEN);
