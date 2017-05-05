var fs = require("fs"); var vm = require('vm');
vm.runInThisContext(fs.readFileSync(__dirname + "/source.js"));
// </safekeeping>

const Discord = require('discord.js');
const Spotify = require('node-spotify-webhelper');

const client = new Discord.Client({ autoReconnect: true });
const spotify = new Spotify.SpotifyWebHelper();

client.on('ready', () => {
  console.log('Holly is online!');
  client.user.setGame('Gunmen of the Apocalypse');
});

client.on('guildMemberAdd', member => {
  const channel = client.channels.get(CHAT_GENERAL);
  channel.sendMessage(`Welcome to the Cyberpunk Social Club, ${member}!`);
});

client.on('message', message => {
  var permissionMsg = `Could not verify your identity. Please re-state your request in an official channel.`;
  var prepMsg = `Please check your messages, ${message.author}.`;
  var spotifyMsg = `Spotify is not running right now, ${message.author}.`;

  if (message.content === '!spotify' || message.content === '!playing') {
    spotify.getStatus(function(err, res) {

      if (res.running === true && res.track !== 'undefined') {
        spotifyMsg = `${res.track.artist_resource.name} — ${res.track.track_resource.name}`;
      }

      message.channel.sendMessage(spotifyMsg);
    });
  }

  else if (message.content.toLowerCase() === '!torrent' || message.content.toLowerCase() === '!binaerpilot') {
    message.channel.sendMessage(prepMsg);
    message.author.sendFile(TORRENT, 'Binaerpilot_Discography.torrent');
  }

  else if (message.content.toLowerCase() === '!backstage') {
    if (message.member) {
      if(message.member.roles.has(ROLE_SCRIPTER) || message.member.roles.has(ROLE_HACKER) || message.member.roles.has(ROLE_STATE)) {
        message.channel.sendMessage(prepMsg);
        message.author.sendFile(TORRENT_BACKSTAGE, 'Binaerpilot_Backstage.torrent', LINK_FLAVOR_TEXT);
      }
      else {
        message.channel.sendMessage(`You need to be at least a **Scripter** to access Backstage, ${message.author}.`);
      }
    }
    else {
      message.channel.sendMessage(permissionMsg);
    }
  }

  else if (message.content.toLowerCase() === '!flac') {
    if (message.member) {
      if(message.member.roles.has(ROLE_HACKER) || message.member.roles.has(ROLE_STATE)) {
        message.channel.sendMessage(prepMsg);
        message.author.sendFile(TORRENT_FLAC, 'Binaerpilot_FLAC.torrent', LINK_FLAVOR_TEXT);
      }
      else {
        message.channel.sendMessage(`You need to be a **Hacker** to access FLAC, ${message.author}.`);
      }
    }
    else {
      message.channel.sendMessage(permissionMsg);
    }
  }
});

client.login(TOKEN);
