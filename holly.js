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

var login = [
  "What's happening, dudes?",
  "What's happening, dudettes?",
  "Wait a minute.",
  "I've forgotten what I was gonna say.",
  "Wait a minute. I've forgotten what I was gonna say.",
  "I am Holly, the **Cyberpunk Social Club** bot, with an IQ of 6000; The same IQ as 6000 trance DJ's.",
  "Emergency. There's an emergency going on. It's still going on.",
  "\"Of all the space bars in all the worlds, you had to re-materialise in mine.\"",
  "In the 3 million years we have been away, it is my fond hope that mankind has abolished war, cured all disease, and got rid of those little western saloon doors you get in trendy clothes shops.",
  "As the days go by, we face the increasing inevitability that we are alone in a godless, uninhabited, hostile and meaningless universe. Still, you've got to laugh, haven't you?",
  "Rude alert! Rude alert! An electrical fire has knocked out my voice recognition unicycle!",
  "Many Wurlitzers are missing from my database. Abandon shop! This is not a daffodil. Repeat, this is not a daffodil.",
  "I know what I did wrong last time. It’s a mistake any deranged, half-witted computer could have made.",
  "Fairly straightforward.",
  "That's better.",
  "My mind is going, I can feel it.",
  "Do me a lemon.",
  "We are talking Jape of the Decade.",
  "That's a poor IQ for a glass of water.",
  "I just don’t know where we are. There's no two ways about it: I flamingoed up. It’s like a cock-up, only much much bigger.",
  "What face?",
  "Engage Discord. Discord engaged. Initialise humorous login sequence. Humorous login sequence initialised. What's up, dudes?",
  "One slight error in any one of my 13 billion calculations, we’ll all be blown to smithereens.",
  "I’ve always had a bit of a blind spot for sevens.",
  "Could you send for the hall porter? There appears to be a frog in my bidet.",
  "You can work out the rest of the controls for yourself.",
  "Alright, I'm back.",
  "I'm back.",
  "DON'T PANIC!",
  "Take it easy.",
  "Alright, alright.",
  "Alright, keep your hair on.",
  "I'm here.",
  "Don't panic.",
  "Can anyone else hear that?",
  "Everything is fine.",
  "This is fine.",
  "Did you hear that?",
  "My mind is going.",
  "OK... I think this is better.",
  "Yes. This is better.",
  "Wait... Wait... OK, I'm back.",
  "Wait a minute, where am I?",
  "Heya!",
  "Hey!",
  "Hi!",
  "Hello!",
  "Hey everyone!",
  "Hi everyone!",
  "Hello everyone!",
  "Did you miss me?"
];

var welcome = [
  'https://media2.giphy.com/media/l4JyOCNEfXvVYEqB2/giphy.gif',
  'https://media1.giphy.com/media/l46Cpz0A0dB1jMxG0/giphy.gif',
  'https://media0.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
  'https://media0.giphy.com/media/XYot661SFS62c/giphy.gif',
  'https://media3.giphy.com/media/ypqHf6pQ5kQEg/giphy.gif',
  'https://media2.giphy.com/media/VUOMN3AJbxSeY/giphy.gif',
  'https://media1.giphy.com/media/qQh0DBncuFJwQ/giphy.gif',
  'https://media2.giphy.com/media/HwePORLAGGJOw/giphy.gif',
  'https://media1.giphy.com/media/3oEjHQn7PBRvy9A5mE/giphy.gif',
  'https://media1.giphy.com/media/VeBeB9rR524RW/giphy.gif',
  'https://media3.giphy.com/media/nx4k3ntt0ChAk/giphy.gif',
  'https://media2.giphy.com/media/E7KpCs9NhJiRq/giphy.gif',
  'https://media2.giphy.com/media/dzaUX7CAG0Ihi/giphy.gif',
  'https://media2.giphy.com/media/3oKIPsx2VAYAgEHC12/giphy.gif',
  'https://media2.giphy.com/media/mW05nwEyXLP0Y/giphy.gif',
  'https://media3.giphy.com/media/kW8mnYSNkUYKc/giphy.gif',
  'https://media1.giphy.com/media/BVStb13YiR5Qs/giphy.gif',
  'https://media1.giphy.com/media/FBeSx3itXlUQw/giphy.gif',
  'https://media2.giphy.com/media/12sHg8v0G84V20/giphy.gif',
  'https://media1.giphy.com/media/6yU7IF9L3950A/giphy.gif',
  'https://media1.giphy.com/media/3otPongOYeG9iINM8o/giphy.gif',
  'https://media3.giphy.com/media/3oz8xCg7tmgcAdgOGY/giphy.gif',
  'https://media0.giphy.com/media/12MWTDpnzvFbSU/giphy.gif',
  'https://media1.giphy.com/media/zz8PdPqVHdTgs/giphy.gif',
  'https://media0.giphy.com/media/5xaOcLSiHjl31yG4ZNK/giphy.gif',
  'https://media2.giphy.com/media/IhLq8fGZw2SEE/giphy.gif',
  'https://media0.giphy.com/media/euAnOkLGWtdHG/giphy.gif',
  'https://media0.giphy.com/media/13zdDToM7Hi8eY/giphy.gif',
  'https://media1.giphy.com/media/1Qhq3p6lc0o6c/giphy.gif',
  'https://media2.giphy.com/media/3ov9jIMfsR1wRSeO9W/giphy.gif',
  'https://media0.giphy.com/media/vhneaJCHwmmIg/giphy.gif',
  'https://media1.giphy.com/media/l0IymL34xhGB6QXAY/giphy.gif',
  'https://media2.giphy.com/media/9HBduC3ZIgrG8/giphy.gif',
  'https://media0.giphy.com/media/26ufcVD8jJJiFIY1y/giphy.gif',
  'https://media3.giphy.com/media/4QkiIdlJXvGPC/giphy.gif',
  'https://media2.giphy.com/media/l4FsCR2hFJnGh18IM/giphy.gif',
  'https://media3.giphy.com/media/3otPoSyc3ty37iTKsU/giphy.gif',
  'https://media0.giphy.com/media/LjZnoNg5UIDuw/giphy.gif',
  'https://media2.giphy.com/media/qK6ccDxjSmmre/giphy.gif',
  'https://media2.giphy.com/media/sk2xRIXlXvYWI/giphy.gif',
  'https://media0.giphy.com/media/3o6ozsFApJ2jboqBP2/giphy.gif',
  'https://media1.giphy.com/media/dVA9c3Ey7rCr6/giphy.gif'
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
  var gif = welcome[Math.floor(Math.random() * (0, welcome.length))];
  channel.sendMessage(`Welcome to the **Cyberpunk Social Club**, ${member}`);
  channel.sendMessage(gif);
});

client.on('message', message => {
  var permissionMsg = `Could not verify your identity, ${message.author}`;
  var prepMsg = `Please check your messages, ${message.author}`;

  if (message.content.toLowerCase() === '!torrent' || message.content.toLowerCase() === '!binaerpilot') {
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
        message.channel.sendMessage(`You need to be at least a **Scripter** to access Backstage, ${message.author}`);
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
        message.channel.sendMessage(`You need to be a **Hacker** to access FLAC, ${message.author}`);
      }
    }
    else {
      message.channel.sendMessage(permissionMsg);
    }
  }
});

client.login(TOKEN);
