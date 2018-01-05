var fs = require("fs");
var vm = require('vm');

const Discord = require('discord.js');
const client = new Discord.Client({ autoReconnect: true });
vm.runInThisContext(fs.readFileSync(__dirname + "/source.js"));

var games = ['Back to Reality',
    'Better Than Life',
    'Gunmen of the Apocalypse',
    'Play-by-mail Chess'
  ];

var login = ["What's happening, dudes?",
    "Wait a minute. I've forgotten what I was gonna say.",
    "All right, keep your hair on.",
    "I am Holly, the **Cyberpunk Social Club** bot, with an IQ of 6000; The same IQ as 6000 trance DJ's.",
    "Emergency. There's an emergency going on. It's still going on.",
    "\"Of all the space bars in all the worlds, you had to re-materialise in mine.\"",
    "In the 3 million years we have been away, it is my fond hope that mankind has abolished war, cured all disease, and got rid of those little western saloon doors you get in trendy clothes shops.",
    "As the days go by, we face the increasing inevitability that we are alone in a godless, uninhabited, hostile and meaningless universe. Still, you've got to laugh, haven't you?",
    "All right, dudes? Anyone fancy a game of Charades using just your nose or is this a bad time?",
    "Rude alert! Rude alert! An electrical fire has knocked out my voice recognition unicycle! Many Wurlitzers are missing from my database. Abandon shop! This is not a daffodil. Repeat, this is not a daffodil."
  ];

client.on('ready', () => {
  const channel = client.channels.get(CHAT_GENERAL);
  var loginMsg = login[Math.floor(Math.random() * (0, login.length))];
  var playingMsg = games[Math.floor(Math.random() * (0, games.length))];

  channel.sendMessage(loginMsg);
  client.user.setPresence({game: {name: playingMsg, type: 0 }});
});

client.on('guildMemberAdd', member => {
  const channel = client.channels.get(CHAT_GENERAL);

  channel.sendMessage(`:robot: :loudspeaker: Welcome to the **Cyberpunk Social Club**, ${member}!`);
});

client.on('message', message => {
  var permissionMsg = `Could not verify your identity. Re-state your request in an official channel.`;
  var playingMsg = `No track information available, ${message.author}.`;
  var prepMsg = `Please check your messages, ${message.author}.`;

  if (message.content.toLowerCase() === '!playing' || message.content.toLowerCase() === '!spotify') {
    vm.runInThisContext(fs.readFile('../CSC/json/track-info.json', 'utf8', function (err, data) {
      var track = JSON.parse(data);
      if (track.artist && track.song) {
        playingMsg = `${track.artist} — ${track.song}`
      }

      message.channel.sendMessage(playingMsg);
    }));
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
