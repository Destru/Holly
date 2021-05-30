require('dotenv').config()
require('discord-reply')
const Discord = require('discord.js')
const client = new Discord.Client()
const db = require('flat-db')
const fetch = require('node-fetch')
const findahaiku = require('findahaiku')

const businessChannels = ['845382463685132288', '829717667107700746']
const complimentChannels = ['845382463685132288', '836963196916858902']
const complimentEmoji = [
  ':heart:',
  ':heart_eyes:',
  ':black_heart:',
  ':blue_heart:',
  ':brown_heart:',
  ':green_heart:',
  ':orange_heart:',
  ':purple_heart:',
  ':sparkling_heart:',
  ':white_heart:',
  ':yellow_heart:',
  ':smiling_face_with_3_hearts:',
  ':kiss:',
  ':kissing:',
  ':kissing_heart:',
  ':kissing_closed_eyes:',
  ':kissing_smiling_eyes:',
]
const insultUsers = ['400786664861204481']
const randomChance = 0.01
const status = [
  'Back to Reality',
  'Better Than Life',
  'Gunmen of the Apocalypse',
  'Play-by-mail Chess',
]
const version = process.env.npm_package_version || '(Development)'

db.configure({
  dir: './db',
})

const Haiku = new db.Collection('haikus', {
  author: '',
  channel: '',
  content: '',
})

client.on('message', (message) => {
  // bot interactions
  if (insultUsers.includes(message.author.id) && Math.random() < randomChance) {
    fetch('https://insult.mattbas.org/api/insult.json')
      .then((response) => response.json())
      .then((data) => {
        message.channel.send(`${data.insult}, ${message.author}`)
      })
  } else if (message.author.bot) return

  // haiku
  const { isHaiku, formattedHaiku } = findahaiku.analyzeText(message.content)

  if (isHaiku) {
    const embed = new Discord.MessageEmbed()
      .setColor('#ff00ff')
      .setDescription(`${formattedHaiku}\n—*${message.author.username}*`)
      .setTitle('Haiku')

    Haiku.add({
      author: message.author.id,
      channel: message.channel.id,
      content: formattedHaiku,
    })

    message.lineReply(embed)
  } else if (message.content.startsWith('!haikus')) {
    let author = message.author.id
    let matches = message.content.match(/<@!(\d+)>/)

    if (matches) author = matches[1]

    const haikus = Haiku.find().matches('author', author).run()

    if (haikus.length > 0) {
      const embed = new Discord.MessageEmbed()
        .setColor('#ff00ff')
        .setTitle('Haikus')

      haikus.forEach((haiku) => {
        const timestamp = new Date(haiku._ts_).toLocaleString([], {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })

        embed.addField(timestamp, haiku.content)
      })

      message.channel.send(embed)
    } else
      message.channel.send(
        `>>> I searched the data\nfor a couple of seconds\nbut there's nothing there.`
      )
  }

  // all-caps
  else if (message.channel.id === '412714197399371788') {
    const number =
      ':zero: :one: :two: :three: :four: :five: :six: :seven: :eight: :nine'.split(
        ' '
      )

    if (!message.content.match(/^[A-Z.,:;-_!?()"'\/]+$/gm)) {
      message.delete()
      message.channel.send(`${message.author.username.toUpperCase()} HAS DIED`)
      message.member.roles.add('832393909988491304')
    }
  }

  // cute compliments
  else if (
    complimentChannels.includes(message.channel.id) &&
    Math.random() < randomChance
  ) {
    fetch('https://complimentr.com/api')
      .then((response) => response.json())
      .then((data) => {
        let compliment =
          data.compliment.charAt(0).toUpperCase() + data.compliment.slice(1)
        let emoji = complimentEmoji[Math.floor(Math.random() * status.length)]

        message.channel.send(`${compliment}, ${message.author} ${emoji}`)
      })
  }

  // business talk
  else if (
    businessChannels.includes(message.channel.id) &&
    Math.random() < randomChance
  ) {
    fetch('https://corporatebs-generator.sameerkumar.website/')
      .then((response) => response.json())
      .then((data) => {
        let bullshit =
          data.phrase.charAt(0).toUpperCase() +
          data.phrase.toLowerCase().slice(1)
        message.channel.send(`${bullshit} :man_office_worker:`)
      })
  }

  // fuckaneolib
  else if (message.content.startsWith('!bot-info')) {
    message.channel.send(
      `I am Holly, the CSC computer, with an IQ of 6000; the same IQ as 6000 neoliberals.`
    )
  }
})

client.on('ready', () => {
  console.log(`Holly ${version} is online.`)

  client.user.setPresence({
    status: 'online',
    activity: {
      name: status[Math.floor(Math.random() * status.length)],
      type: 'PLAYING',
    },
  })
})

client.login()
