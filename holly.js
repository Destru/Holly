require('dotenv').config()
require('discord-reply')
const Discord = require('discord.js')
const client = new Discord.Client()
const db = require('flat-db')
const fetch = require('node-fetch')
const findahaiku = require('findahaiku')
const prettyMs = require('pretty-ms')

const admin = '160320553322807296'
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
const embedColor = '#ff00ff'
const insultUsers = ['400786664861204481']
const randomChance = 0.01
const randomEmoji = () => {
  const emoji = [
    '<:cscalt:837251418247004205>',
    '<:cscbob:846528128524091422>',
    '<:csc:403256716583632906>',
  ]
  return emoji[Math.floor(Math.random() * emoji.length)]
}
const ranks = {
  5: 'Dissident',
  10: 'Activist',
  15: 'Insurgent',
  20: 'Revolutionary',
  25: 'Augmented',
  30: 'Cyborg',
  35: 'Android',
  40: 'Replicant',
  50: 'Cyberpunk',
  60: 'Tron',
}
const roleGhost = '832393909988491304'
const status = [
  'Back to Reality',
  'Better Than Life',
  'Gunmen of the Apocalypse',
  'Play-by-mail Chess',
]
const version = process.env.npm_package_version || '(Development)'

db.configure({ dir: './db' })

const Avatar = new db.Collection('avatars', {
  uid: '',
  name: '',
  seed: '',
  style: '',
})

const Haiku = new db.Collection('haikus', {
  uid: '',
  channel: '',
  content: '',
})

client.on('message', (message) => {
  // trebek
  if (insultUsers.includes(message.author.id) && Math.random() < randomChance) {
    fetch('https://insult.mattbas.org/api/insult.json')
      .then((response) => response.json())
      .then((data) => {
        message.channel.send(`${data.insult}, ${message.author}`)
      })
  }

  // promotions
  else if (
    message.channel.id === '405503298951446528' &&
    message.author.id === '836661328374267997'
  ) {
    const matches = message.content.match(/<@(\d+)> has reached level (\d+)/)
    const promotionChannel =
      message.client.channels.cache.get('160320676580818951')

    let level, user

    if (matches) {
      level = parseInt(matches[2])
      user = message.guild.members.cache.get(matches[1])

      fetch(
        `https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_TOKEN}&tag=applause&rating=pg13`
      )
        .then((response) => response.json())
        .then((data) => {
          message.channel.send(data.data.embed_url)
        })
    }

    if (matches && ranks[level]) {
      const embed = new Discord.MessageEmbed()

      let adjective = `a contributing`

      if (level >= 50) adjective = `a *godlike*`
      else if (level >= 40) adjective = `an inspiring`
      else if (level >= 30) adjective = `a prolific`
      else if (level >= 20) adjective = `an important`

      let description =
        `${user} has been promoted to **${ranks[level]}** ${randomEmoji()}` +
        `\n\nThank you for being ${adjective} member of this community. `

      switch (level) {
        case 5:
          description +=
            `You're now considered a comrade, ` +
            `and have been granted access to the \`Limited\` channels. `
          break
        case 10:
          description +=
            `You can now post in <#352149516885164044> (syndicated), ` +
            `host in <#833933467142062110>, ` +
            `and will receive the \`Live\` role when you stream. `
          break
        case 50:
          description +=
            `You have joined the *Hacker's Club*; ` +
            `backdoor access has been granted. `
          break
        case 60:
          description +=
            `You have unlocked the *Master Control Program*, ` +
            `and may change your color at will. `
          break
        default:
          description += `Enjoy your new color, comrade.`
      }

      embed
        .setColor(user.displayHexColor)
        .setDescription(description)
        .setTitle('Promotion')
        .setThumbnail(message.mentions.users.first().avatarURL())

      setTimeout(() => {
        promotionChannel.send(embed)
      }, 15000)
    }
  } else if (message.author.bot) return

  // haiku
  const { isHaiku, formattedHaiku } = findahaiku.analyzeText(message.content)

  if (isHaiku) {
    const embed = new Discord.MessageEmbed()
      .setColor(embedColor)
      .setDescription(`${formattedHaiku}\n—*${message.author.username}*`)

    Haiku.add({
      uid: message.author.id,
      channel: message.channel.id,
      content: formattedHaiku,
    })

    message.lineReply(embed)
  } else if (message.content.startsWith('!haikus')) {
    let author = message.author.id
    let matches = message.content.match(/<@!(\d+)>/)

    if (matches) author = matches[1]

    const haikus = Haiku.find().matches('uid', author).run()

    if (haikus.length > 0) {
      const embed = new Discord.MessageEmbed()
        .setColor(embedColor)
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
  if (message.channel.id === '412714197399371788') {
    const allCaps = /^[A-Z0-9\s-_,./?;:'"`’~!@#$%^&*()=+|\\<>\[\]{}]+$/gm

    if (!message.content.match(allCaps)) {
      message.delete()
      message.member.roles.add(roleGhost)
      message.channel.send(`${message.author.username.toUpperCase()} HAS DIED`)
    }
  }

  // vr-chat
  if (message.channel.id === '848997740767346699') {
    const apis = {
      robot: {
        url: 'https://robohash.org/',
      },
      monster: {
        url: 'https://robohash.org/',
        append: '.png?set=set2',
      },
      robot2: {
        url: 'https://robohash.org/',
        append: '.png?set=set3',
      },
      kitten: {
        url: 'https://robohash.org/',
        append: '.png?set=set4',
      },
    }

    const customAvatar = (avatar, message) => {
      const api = avatar.style ? apis[avatar.style] : apis.robot
      const seed = avatar.seed ? avatar.seed : message.author.id
      let append

      if (avatar.style && 'append' in apis[avatar.style]) {
        append = apis[avatar.style].append
      } else append = ''

      return api.url + seed + append
    }

    const customName = (avatar) => {
      return avatar.name ? avatar.name : 'Anonymous'
    }

    const matches = Avatar.find().matches('uid', message.author.id).run()
    const textOnly = /^[a-zA-Z0-9\s-_,./?;:'"`’~!@#$%^&*()=+|\\<>\[\]{}]+$/gm

    let avatar

    if (matches.length > 0) {
      avatar = { ...matches[0] }
    } else {
      avatar = Avatar.add({
        uid: message.author.id,
      })
    }

    message.delete()

    if (message.content.startsWith('!')) {
      if (message.content.startsWith('!seed')) {
        const random = Math.random().toString().slice(2, 11)

        Avatar.update(avatar._id_, {
          seed: random,
        })
      } else if (message.content.startsWith('!name')) {
        let name = message.content.replace('!name', '').trim()

        Avatar.update(avatar._id_, {
          name: name,
        })
      } else if (message.content.startsWith('!style')) {
        let style = message.content.replace('!style', '').trim()

        if (style in apis) {
          Avatar.update(avatar._id_, {
            style: style,
          })
        }
      } else if (message.author.id === admin) {
        if (message.content.startsWith('!reset')) Avatar.reset()
      }
    } else {
      if (!message.content.match(textOnly) && description.length > 2048) {
        message.member.roles.add(roleGhost)
        message.channel.send(`${message.author.id} has died.`)
      } else {
        const embed = new Discord.MessageEmbed()
          .setAuthor(
            customName(avatar),
            customAvatar(avatar, message),
            'https://cyberpunksocial.club'
          )
          .setColor(message.member.displayHexColor)
          .setDescription(message.content)

        message.channel.send(embed)
      }
    }
  }

  // business
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

  // compliments
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

  // !bot-info
  else if (message.content.startsWith('!bot-info')) {
    const embed = new Discord.MessageEmbed()
      .setColor(embedColor)
      .setDescription(
        `I have an IQ of 6000; the same IQ as 6000 neoliberals.` +
          `\n[GitHub Repo](https://github.com/destru/holly) :link:`
      )
      .setTitle('Holly')
      .addFields(
        {
          name: 'Latency',
          value:
            `${Date.now() - message.createdTimestamp}ms /` +
            `${Math.round(message.client.ws.ping)}ms`,
          inline: true,
        },
        {
          name: 'Uptime',
          value: prettyMs(message.client.uptime),
          inline: true,
        },
        { name: 'Version', value: version, inline: true }
      )
    message.channel.send(embed)
  }

  // !version
  else if (message.content.startsWith('!version')) {
    message.channel.send(version)
  }
})

client.on('messageUpdate', (message) => {
  if (message.channel.id === '848998146608594984') {
    message.member.roles.add(roleGhost)
    message.delete()
    message.channel.send(
      `\*\*\* ${message.author.username} has quit IRC (Killed).`
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
