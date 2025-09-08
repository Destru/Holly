require('dotenv').config()
require('discord-reply')
const Discord = require('discord.js')
const fs = require('fs')
const client = new Discord.Client()
const db = require('flat-db')
const cron = require('node-cron')
const findahaiku = require('findahaiku')
const paginationEmbed = require('discord.js-pagination')
const path = require('path')
const prettyMs = require('pretty-ms')
const checkWord = require('check-word')
const dictionary = checkWord('en')

const { COLORS, CHANNELIDS, EMOJIIDS, IDS, ROLEIDS } = require('./config')
const BADGES = [
  {
    name: 'Anonymous',
    description: 'Has an anonymous avatar.',
    emoji: '<:anonymous:837247849145303080>',
  },
  {
    name: 'Artist',
    description: 'Creative member.',
    emoji: '🧑‍🎨',
  },
  {
    name: 'Comrade',
    description: 'Written a biography.',
    emoji: '<:comrade:428333024631848980>',
  },
  {
    name: 'Hacker',
    description: "Member of the Hacker's Club",
    emoji: '🛰️',
  },
  {
    name: 'Immortal',
    description: 'An immortal being.',
    emoji: '💀',
  },
  {
    name: 'Memer',
    description: 'Posts a lot of garbage.',
    emoji: '<:kekw:830114281168699412>',
  },
  {
    name: 'Operator',
    description: 'Member of the admin team.',
    emoji: '<:csc:837251418247004205>',
  },
  {
    name: 'Patron',
    description: 'Patreon supporter.',
    emoji: '❤️',
  },
  {
    name: 'Poet',
    description: 'Writes haikus.',
    emoji: '📝',
  },
  {
    name: 'PSYOP',
    description: 'Twitch subscriber.',
    emoji: '🧠',
  },
  {
    name: 'Rabbit',
    description: 'Jrag qbja gur enoovg ubyr.',
    emoji: '[🐰](https://github.com/Destru/Holly/blob/master/key.md)',
  },
]
const METASTATS = ['oc', 'memes', 'stimulus', 'acronyms', 'bandnames']
const PREFIX = '!'
const STATUS = [
  'Back to Reality',
  'Better Than Life',
  'Gunmen of the Apocalypse',
  'Play-by-mail Chess',
]

let KEY
fs.readFile('./key.md', 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  KEY = data.trim()
})

const acronymString =
  'csc '.repeat(42) +
  'afk aka ama asap awol bae bbl bbs biab bolo brb btw diy dnd eta fish fomo fu fubar fyi idk imo irl kiss lmao lmk lol mia noyb omg pos pov rofl smh stfu tbh ttyl ttys wth wtf yolo ' +
  'cia cdc csi dmc fbi osha lapd nasa nsa nypd potus rnc sat scotus swat ' +
  'cccp kgb tst ' +
  'cd css dvd gif html lcd led jpeg jpg midi png ' +
  'faq iq hr ppv pr suv tba vhs ufo ' +
  'ftp irc ssh www ' +
  'add adhd aids hiv hpv md lsd ocd'
const acronyms = acronymString.split(' ')
const alphabet = 'abcdefghijklmnopqrstuvwxyz'
const alphabetEmoji =
  '🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿'.split(
    ' '
  )
const capitalize = (string) => {
  if (typeof string !== 'string') return string
  return string.charAt(0).toUpperCase() + string.slice(1)
}
const leaderboardCount = 10
const isImmortal = (id) => {
  const immortal = Immortal.find()
    .run()
    .sort((a, b) => a.score - b.score)
    .pop()
  if (immortal && immortal.uid === id) return true
  else return false
}
const hasContent = (message) => {
  return (
    message.content.includes('http://') ||
    message.content.includes('https://') ||
    message.attachments.size > 0
  )
}
const perPage = 5
const quotes = [
  `Rude alert! Rude alert! An electrical fire has knocked out my voice recognition unicycle! Many Wurlitzers are missing from my database.`,
  `We have enough food to last thirty thousand years, but we've only got one Milk Dud left. And everyone's too polite to take it.`,
  `Our deepest fear is going space crazy through loneliness. The only thing that helps me keep my slender grip on reality is the friendship I have with my collection of anime waifus.`,
  `Well, the thing about a black hole, its main distinguishing feature, is it's black. And the thing about space, the colour of space, your basic space colour, is black. So how are you supposed to see them?`,
  `Going round in circles for 14 months. Getting my information from the Junior Color Encyclopedia of Space. The respect you have for me is awesome, innit?`,
]

const formatBytes = (bytes) => {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes = bytes / 1024
    i++
  }
  const value = Math.round(bytes * 10) / 10
  return `${value} ${units[i]}`
}

const getDirSize = (dirPath) => {
  let total = 0
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isFile()) {
        try {
          const stats = fs.statSync(fullPath)
          total += stats.size
        } catch (e) {}
      } else if (entry.isDirectory()) {
        total += getDirSize(fullPath)
      }
    }
  } catch (e) {
    return 0
  }
  return total
}

const randomAcronym = () => {
  const channel = client.channels.cache.get(CHANNELIDS.acronyms)
  const matches = Meta.find().matches('name', 'acronyms').limit(1).run()
  let acronym = acronyms[Math.floor(Math.random() * acronyms.length)]
  let topic = ''

  if (matches.length > 0) {
    while (acronym === matches[0].value) {
      acronym = acronyms[Math.floor(Math.random() * acronyms.length)]
    }
    Meta.update(matches[0]._id_, { value: acronym })
  } else {
    Meta.add({ name: 'acronyms', value: acronym })
  }

  for (i = 0; i < acronym.length; i++) {
    topic += `${alphabetEmoji[acronym.charCodeAt(i) - 97]} `
  }

  channel.setTopic(`${topic} :skull:`)
}
const randomChance = 0.025
const randomEmoji = () => {
  const emoji = ['<:csc:837251418247004205>', '<:cscbob:846528128524091422>']
  return emoji[Math.floor(Math.random() * emoji.length)]
}
const randomLetter = () => {
  const channel = client.channels.cache.get(CHANNELIDS.wordwar)
  const matches = Meta.find().matches('name', 'word-war').limit(1).run()
  const random = Math.floor(Math.random() * alphabet.length)

  let randomLetter = alphabet[random]

  if (matches.length > 0) {
    while (randomLetter === matches[0].value) {
      randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    Meta.update(matches[0]._id_, { value: randomLetter })
  } else {
    Meta.add({ name: 'word-war', value: randomLetter })
  }

  channel.setTopic(`${alphabetEmoji[random]} :skull:`)
}
const ranks = {
  5: 'Comrade',
  10: 'Activist',
  15: 'Insurgent',
  20: 'Revolutionary',
  25: 'Augmented',
  30: 'Cyborg',
  35: 'Android',
  40: 'Replicant',
  50: 'Cyberpunk',
}
const setReactions = (message, type = false) => {
  setTimeout(() => {
    switch (type) {
      case 'csc':
        message.react(EMOJIIDS.csc)
        break
      case 'upvote':
        if (message.channel.id === CHANNELIDS.memes)
          message.react(EMOJIIDS.kekw)
        else message.react(EMOJIIDS.upvote)
        break
      case 'skull':
        message.react('💀')
        break
      case 'binaerpilot':
        message.react(EMOJIIDS.binaerpilot)
        break
      case 'heart':
      default:
        message.react(EMOJIIDS.heart)
    }
  }, 1000)
}
const subjectId = (message) => {
  const matches = message.content.match(/<@!?(\d+)>/)
  let id = message.author.id
  if (matches) id = matches[1]
  return id
}

const timerFeedbackDelete = 10000
const trackByName = (id, name) => {
  let match = Meta.find()
    .matches('uid', id)
    .matches('name', name)
    .limit(1)
    .run()
  if (match.length > 0) {
    Meta.update(match[0]._id_, {
      value: `${parseInt(match[0].value) + 1}`,
    })
  } else {
    Meta.add({
      name: name,
      uid: id,
      value: '1',
    })
  }
}
const version = process.env.npm_package_version

db.configure({ dir: './data' })
const Bio = new db.Collection('bios', {
  uid: '',
  url: '',
})
const Death = new db.Collection('deaths', {
  uid: '',
  deaths: '',
})
const Haiku = new db.Collection('haikus', {
  uid: '',
  channel: '',
  content: '',
})
const Immortal = new db.Collection('immortals', {
  uid: '',
  score: '',
})
const Meta = new db.Collection('meta', {
  uid: '',
  name: '',
  value: '',
})
const Resurrection = new db.Collection('resurrections', {
  uid: '',
})

client.on('message', (message) => {
  const args = message.content.slice(1).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  const { isHaiku, formattedHaiku } = findahaiku.analyzeText(message.content)

  const permaDeath = () => {
    const channelGraveyard = client.channels.cache.get(CHANNELIDS.graveyard)
    const obituary = new Discord.MessageEmbed()
      .setColor(COLORS.embedBlack)
      .setThumbnail(message.author.avatarURL())
      .setTitle(`Death 💀`)
      .setDescription(`${message.author} died in ${message.channel}`)

    if (!isImmortal(message.author.id)) {
      if (message) setReactions(message, 'skull')
      message.member.roles.add(ROLEIDS.ghost)
      channelGraveyard.send(obituary)
      permaDeathScore(true)
    } else {
      permaDeathScore(false, Math.floor(Math.random() * 10) + 1)
    }
  }
  const permaDeathScore = (death = false, penalty = 0) => {
    const matches = Immortal.find()
      .matches('uid', message.author.id)
      .limit(1)
      .run()

    let immortal

    if (matches.length > 0) {
      immortal = matches[0]
    } else {
      let immortalKey = Immortal.add({
        uid: message.author.id,
        score: '0',
      })

      immortal = Immortal.get(immortalKey)
    }

    if (death) {
      const deaths = Death.find().matches('uid', message.author.id).run()

      if (deaths.length > 0) {
        Death.update(deaths[0]._id_, {
          deaths: `${parseInt(deaths[0].deaths) + 1}`,
        })
      } else {
        Death.add({
          uid: message.author.id,
          deaths: '1',
        })
      }

      Immortal.update(immortal._id_, {
        score: '0',
      })
    } else {
      if (penalty > 0) {
        if (penalty > immortal.score) penalty = immortal.score
        Immortal.update(immortal._id_, {
          score: `${parseInt(immortal.score) - penalty}`,
        })
      } else {
        Immortal.update(immortal._id_, {
          score: `${parseInt(immortal.score) + 1}`,
        })
      }
    }
  }

  if (
    !message.author.bot &&
    isHaiku &&
    message.channel.id !== CHANNELIDS.saferspace
  ) {
    const author =
      message.channel.id === CHANNELIDS.allcaps
        ? message.author.username.toUpperCase()
        : message.author.username
    const embed = new Discord.MessageEmbed()
      .setColor(COLORS.embed)
      .setDescription(`${formattedHaiku}\n—*${author}*`)

    Haiku.add({
      uid: message.author.id,
      channel: message.channel.id,
      content: formattedHaiku,
    })

    message.lineReply(embed)
  }

  if (message.author.bot) {
    if (message.channel.id === CHANNELIDS.terminal) {
      if (message.author.id === IDS.hal9000) {
        const matches = message.content.match(
          /<@(\d+)> has reached level (\d+)/
        )
        const promotionChannel = message.client.channels.cache.get(
          CHANNELIDS.chat
        )

        if (matches) {
          const level = parseInt(matches[2])

          if (ranks[level]) {
            const id = matches[1]
            const embed = new Discord.MessageEmbed()

            let adjective = `a contributing member`

            if (level >= 50) adjective = `a cornerstone`
            else if (level >= 40) adjective = `an inspiring member`
            else if (level >= 30) adjective = `a prolific member`
            else if (level >= 20) adjective = `an important member`

            let description =
              `Has been promoted to **${ranks[level]}** ${randomEmoji()}` +
              `\n\nThank you for being ${adjective} of this community. `

            switch (level) {
              case 5:
                description +=
                  `You're now considered a comrade, ` +
                  `and have been granted access to \`Limited\` channels. `
                break
              case 10:
                description += `You will now receive the \`Live\` role when you stream. `
                break
              case 15:
                description +=
                  `You've unlocked an even <#830131461000658994> ` +
                  `with anonynomous confessions. `
                break
              case 50:
                description +=
                  `You have joined the <#831769969095344128>, ` +
                  `and Rootkit access has been granted. `
                break
              default:
                description += `Enjoy your new color, comrade.`
            }

            message.guild.members.fetch(id).then((member) => {
              setTimeout(() => {
                embed
                  .setAuthor(member.user.username, member.user.avatarURL())
                  .setColor(member.displayHexColor)
                  .setDescription(description)
                  .setThumbnail(member.user.avatarURL())
                promotionChannel.send(embed).then((message) => {
                  setReactions(message, 'csc')
                })
              }, 5 * 60 * 1000)
            })
          }
        }
      }
    }
    return
  } else if (message.channel.id === CHANNELIDS.acronyms) {
    const matches = Meta.find()
      .matches('name', 'acronyms')
      .matches('uid', '')
      .run()
    const words = message.content.toLowerCase().trim().split(' ')

    if (matches.length > 0) {
      const acronym = matches[0].value
      let fail = false

      if (words.length === acronym.length) {
        words.forEach((word, i) => {
          if (!dictionary.check(word) || !word.startsWith(acronym[i]))
            fail = true
        })
      } else fail = true

      if (fail === false) {
        message.react('✅')
        permaDeathScore()
        trackByName(message.author.id, 'acronyms')
      } else {
        message.react('❌')
        permaDeath()
      }
    }
  } else if (message.channel.id === CHANNELIDS.allcaps) {
    const allCaps = /^[A-Z0-9\s-_,./?;:'"‘’“”`~!@#$%^&*()=+|\\<>\[\]{}]+$/gm

    if (!message.content.match(allCaps)) {
      message.react('❌')
      permaDeath()
    } else permaDeathScore()
  } else if (message.channel.id === CHANNELIDS.bandnames) {
    setReactions(message, 'upvote')
    trackByName(message.author.id, 'bandnames')
  } else if (message.channel.id === CHANNELIDS.comrades) {
    const embed = new Discord.MessageEmbed()
      .setColor(COLORS.embed)
      .setTitle(`Warning`)
    const matches = Bio.find().matches('uid', message.author.id).limit(1).run()

    if (matches.length > 0) {
      if (message) message.delete()
      embed.setDescription(
        `You're only allowed one (\`1\`) post in this channel.` +
          `\n\n[Edit your last post](${
            matches[matches.length - 1].url
          }) :pencil2:`
      )
      message.channel.send(embed).then((message) => {
        setTimeout(() => {
          if (message) message.delete()
        }, timerFeedbackDelete)
      })
    } else {
      setReactions(message, 'heart')
      Bio.add({
        uid: message.author.id,
        url: message.url,
      })
    }
  } else if (message.channel.id === CHANNELIDS.counting) {
    const matches = Meta.find().matches('name', 'counting').limit(1).run()
    const numOnly = /^\d+$/

    let desiredCount, highscore, meta, messageCount

    if (matches.length > 0) {
      meta = { ...matches[0] }
    } else {
      metaKey = Meta.add({
        name: 'counting',
        uid: message.author.id,
        value: '0|1',
      })

      meta = Meta.get(metaKey)
    }

    desiredCount = parseInt(meta.value.split('|')[0]) + 1
    highscore = parseInt(meta.value.split('|')[1])
    messageCount = parseInt(message.content)

    if (
      message.author.id !== meta.uid &&
      message.content.match(numOnly) &&
      messageCount === desiredCount
    ) {
      if (messageCount > highscore) {
        message.react('☑️')
        Meta.update(meta._id_, {
          uid: message.author.id,
          value: `${messageCount}|${messageCount}`,
        })
      } else {
        message.react('✅')
        Meta.update(meta._id_, {
          uid: message.author.id,
          value: `${messageCount}|${highscore}`,
        })
      }
      permaDeathScore()
    } else {
      message.react('❌')
      Meta.update(meta._id_, {
        uid: message.author.id,
        value: `0|${highscore}`,
      })
      permaDeath()
    }
  } else if (
    (message.channel.id === CHANNELIDS.memes ||
      message.channel.id === CHANNELIDS.stimulus) &&
    hasContent(message)
  ) {
    setReactions(message, 'upvote')
    if (message.channel.id === CHANNELIDS.memes)
      trackByName(message.author.id, 'memes')
    else trackByName(message.author.id, 'stimulus')
  } else if (
    message.channel.id === CHANNELIDS.nsfw ||
    message.channel.id === CHANNELIDS.irl
  ) {
    setReactions(message, 'heart')
  } else if (message.channel.id === CHANNELIDS.patrons && hasContent(message)) {
    setReactions(message, 'binaerpilot')
  } else if (message.channel.id === CHANNELIDS.wordwar) {
    const matches = Meta.find().matches('name', 'word-war').limit(1).run()
    const word = message.content.toLowerCase().trim()

    if (matches.length > 0) {
      const letter = matches[0].value
      const uid = matches[0].uid

      if (
        dictionary.check(word) &&
        message.author.id !== uid &&
        word.startsWith(letter) &&
        word.endsWith(letter)
      ) {
        Meta.update(matches[0]._id_, { uid: message.author.id, value: letter })
        message.react('✅')
        permaDeathScore()
      } else {
        message.react('❌')
        permaDeath()
      }
    }
  } else if (
    [CHANNELIDS.comrades, CHANNELIDS.wip].includes(message.channel.id) &&
    hasContent(message)
  ) {
    setReactions(message, 'csc')
    trackByName(message.author.id, 'oc')
  }

  if (message.content.startsWith(PREFIX)) {
    if (command === 'acronym') {
      const matches = Meta.find('name', 'acronym').limit(1).run()
      const acronym = matches[0].value
      if (matches.length > 0) return message.channel.send(acronyms[acronym])
    } else if (command === 'age') {
      const id = subjectId(message)

      message.guild.members.fetch(id).then((member) => {
        const memberFor = Date.now() - member.joinedAt.getTime()
        return message.channel.send(prettyMs(memberFor))
      })
    } else if (command === 'badge' || command === 'badges') {
      const embed = new Discord.MessageEmbed().setColor(COLORS.embed)
      if (args[0]) {
        let badge = BADGES.find((badge) => {
          return badge.name.toLowerCase() === args[0].toLowerCase()
        })
        let output = `No such badge exists.`

        if (badge && badge.name !== 'Rabbit') {
          embed
            .setDescription(badge.description)
            .setTitle(`${badge.name} ${badge.emoji}`)
          output = embed
        }

        return message.channel.send(output)
      }

      embed.setTitle('Badges')

      let badges = []
      BADGES.forEach((badge) => badges.push(`${badge.name} ${badge.emoji}`))

      embed.setDescription(badges.join('\n'))

      return message.channel.send(embed)
    } else if (command === 'bot-info') {
      const embed = new Discord.MessageEmbed()
        .setColor(COLORS.embed)
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
      return message.channel.send(embed)
    } else if (command === 'commands' || command === 'command') {
      const embed = new Discord.MessageEmbed()
        .setColor(COLORS.embed)
        .setDescription(quotes[Math.floor(Math.random() * quotes.length)])
        .setTitle('Commands')
        .addFields(
          {
            name: 'Community <:cscbob:846528128524091422>',
            value:
              '`!age`\n`!badges`\n`!haikus`\n`!profile`\n`!resurrect`\n`!stats`',
            inline: true,
          },
          {
            name: 'Permadeath :skull:',
            value: '`!deaths`\n`!permadeath`\n`!points`',
            inline: true,
          }
        )

      return message.channel.send(embed)
    } else if (command === 'deaths') {
      const deaths = Death.find().run()
      let deathCount = 0
      deaths.forEach((death) => {
        deathCount = deathCount + parseInt(death.deaths)
      })

      const embed = new Discord.MessageEmbed()
        .setColor(COLORS.embedBlack)
        .setDescription(`There have been \`${deathCount}\` recorded deaths.`)
        .setTitle(`Deaths 🪦`)

      if (deaths.length > 0) {
        const deathsSorted = deaths.sort((a, b) => a.deaths - b.deaths)
        const deathsRanked = deathsSorted.reverse()

        let entries =
          deaths.length > leaderboardCount ? leaderboardCount : deaths.length
        let leaderboard = []

        for (let i = 0; i < entries; i++) {
          const score = deathsRanked[i].deaths
          const user = `<@${deathsRanked[i].uid}>`

          leaderboard.push(`\`${i + 1}.\` ${user} \`${score}\``)
        }
        embed.addField('Leaderboard', leaderboard.join('\n'), false)

        return message.channel.send(embed)
      } else message.channel.send('There have been no recorded deaths.')
    } else if (command === 'deploy') {
      if (message.member.roles.cache.has(ROLEIDS.admin)) {
        client.api
          .applications(client.user.id)
          .guilds(IDS.csc)
          .commands.get()
          .then((commands) => {
            client.api
              .applications(client.user.id)
              .guilds(IDS.csc)
              .commands(commands[0].id)
              .delete()
          })

        client.api
          .applications(client.user.id)
          .guilds(IDS.csc)
          .commands.post({
            data: {
              name: 'anon',
              description: 'Send #anonymous messages',
              options: [
                {
                  type: 3,
                  name: 'message',
                  description: 'Text to send',
                  required: true,
                },
                {
                  type: 5,
                  name: 'random',
                  description: 'Randomize avatar',
                  required: false,
                },
              ],
            },
          })

        randomAcronym()
        randomLetter()

        message.channel.send('Deployment successful.')
      }
    } else if (command === 'haikus') {
      const id = subjectId(message)
      const haikus = Haiku.find().matches('uid', id).run()

      if (args[0] === 'remove') {
        if (haikus[args[1]]) {
          Haiku.remove(haikus[args[1] - 1]._id_)
          message.channel.send(`Haiku removed.`)
        } else {
          message.channel.send(`Haiku not found.`)
        }
      } else {
        if (haikus.length > 0) {
          if (haikus.length > perPage) {
            const pages = []
            const pageCount = Math.ceil(haikus.length / perPage)

            message.guild.members.fetch(id).then((member) => {
              for (let page = 0; page < pageCount; page++) {
                let displayHaikus = ''

                const embed = new Discord.MessageEmbed()
                  .setAuthor(member.user.username, member.user.avatarURL())
                  .setColor(COLORS.embed)
                const haikuIndex = perPage * page

                for (i = haikuIndex; i < haikuIndex + perPage; i++) {
                  if (haikus[i]) {
                    displayHaikus +=
                      `\`${i + 1}.\`` +
                      `\n${haikus[i].content}` +
                      `\n<#${haikus[i].channel}>\n\n`
                  }
                }

                embed.setDescription(displayHaikus)
                pages.push(embed)
              }

              return paginationEmbed(message, pages)
            })
          } else {
            message.guild.members.fetch(id).then((member) => {
              const embed = new Discord.MessageEmbed()
                .setAuthor(member.user.username, member.user.avatarURL())
                .setColor(COLORS.embed)

              let displayHaikus = ''

              haikus.forEach((haiku) => {
                displayHaikus +=
                  `${haiku.content}` + `\n<#${haiku.channel}>\n\n`
              })

              embed.setDescription(displayHaikus)
              return message.channel.send(embed)
            })
          }
        } else return message.channel.send(`No haikus found.`)
      }
    } else if (command === 'letter') {
      const matches = Meta.find().matches('name', 'word-war').limit(1).run()

      if (matches.length > 0)
        return message.channel.send(
          alphabetEmoji[alphabet.indexOf(matches[0].value)]
        )
    } else if (command === 'permadeath') {
      const embed = new Discord.MessageEmbed()
        .setColor(COLORS.embedBlack)
        .setDescription(
          `Contributing in :skull: channels awards points. ` +
            `Points reset on death. ` +
            `Whoever has the most points is immortal.`
        )
        .setTitle(`Permadeath`)

      const immortals = Immortal.find().run()

      if (immortals.length > 0) {
        const immortalsSorted = immortals.sort((a, b) => a.score - b.score)
        const immortalRanked = immortalsSorted.reverse()

        let entries =
          immortals.length > leaderboardCount
            ? leaderboardCount
            : immortals.length
        let leaderboard = []

        for (let i = 0; i < entries; i++) {
          const user = `<@${immortalRanked[i].uid}>`
          const score = immortalRanked[i].score

          leaderboard.push(`\`${i + 1}.\` ${user} \`${score}\``)
        }
        embed.addField('Leaderboard', leaderboard.join('\n'), false)
        message.guild.members.fetch(immortalRanked[0].uid).then((member) => {
          embed.setThumbnail(member.user.avatarURL())
          message.channel.send(embed)
        })
      }
    } else if (command === 'ping') {
      message.channel.send(
        `${Date.now() - message.createdTimestamp}ms / ${Math.round(
          message.client.ws.ping
        )}ms`
      )
    } else if (command === 'points') {
      const matches = Immortal.find()
        .matches('uid', message.author.id)
        .limit(1)
        .run()

      if (matches.length > 0) {
        const points = matches[0].score === 1 ? 'point' : 'points'

        message.channel.send(`You have \`${matches[0].score}\` ${points}.`)
      } else message.channel.send(`You have \`0\` points.`)
    } else if (command === 'profile') {
      const embed = new Discord.MessageEmbed()
      const id = subjectId(message)

      message.guild.members.fetch(id).then((member) => {
        const admin =
          member.roles.cache.has(ROLEIDS.admin) ||
          member.roles.cache.has(ROLEIDS.operator)
        const avatar =
          Meta.find()
            .matches('uid', id)
            .matches('name', 'avatar')
            .limit(1)
            .run()[0] || false
        const bio = Bio.find().matches('uid', id).limit(1).run()[0] || false
        const deaths = Death.find().matches('uid', id).limit(1).run()
        const haikus = Haiku.find().matches('uid', id).run()
        const immortal = Immortal.find().matches('uid', id).limit(1).run()
        const patron = member.roles.cache.has(ROLEIDS.patron)
        const psyop = member.roles.cache.has(ROLEIDS.psyop)
        const rabbit = member.roles.cache.has(ROLEIDS.leet)
        const memberFor = Date.now() - member.joinedAt.getTime()

        let badges = [],
          description = '',
          stats = [],
          rank = ''

        let artist = false,
          memer = false

        METASTATS.forEach((stat) => {
          const match = Meta.find()
            .matches('uid', id)
            .matches('name', stat)
            .limit(1)
            .run()
          if (match.length > 0) {
            let name = capitalize(match[0].name)
            if (name.length <= 2) name = name.toUpperCase()
            stats.push(`${name} \`${match[0].value}\``)
            if (match[0].name == 'oc' && match[0].value >= 10) artist = true
            if (match[0].name == 'meme' && match[0].value >= 100) memer = true
          }
        })

        if (member.roles.cache.has(ROLEIDS.cyberpunk)) rank = 'Cyberpunk'
        else if (member.roles.cache.has(ROLEIDS.replicant)) rank = 'Replicant'
        else if (member.roles.cache.has(ROLEIDS.android)) rank = 'Android'
        else if (member.roles.cache.has(ROLEIDS.cyborg)) rank = 'Cyborg'
        else if (member.roles.cache.has(ROLEIDS.augmented)) rank = 'Augmented'
        else if (member.roles.cache.has(ROLEIDS.revolutionary))
          rank = 'Revolutionary'
        else if (member.roles.cache.has(ROLEIDS.insurgent)) rank = 'Insurgent'
        else if (member.roles.cache.has(ROLEIDS.activist)) rank = 'Activist'
        else if (member.roles.cache.has(ROLEIDS.comrade)) rank = 'Comrade'
        else rank = 'Recruit'

        description += `\`${prettyMs(memberFor)}\``

        if (artist) {
          let badge = BADGES.find((badge) => {
            return badge.name === 'Artist'
          })
          badges.push(`${badge.name} ${badge.emoji}\n`)
        }
        if (avatar) {
          let badge = BADGES.find((badge) => {
            return badge.name === 'Anonymous'
          })
          badges.push(`${badge.name} ${badge.emoji}\n`)
        }
        if (bio) {
          let badge = BADGES.find((badge) => {
            return badge.name === 'Comrade'
          })
          badges.push(`${badge.name} [${badge.emoji}](${bio.url})\n`)
        }
        if (admin) {
          let badge = BADGES.find((badge) => {
            return badge.name === 'Operator'
          })
          badges.push(`${badge.name} ${badge.emoji}\n`)
        }
        if (
          member.roles.cache.has(ROLEIDS.engineer) ||
          member.roles.cache.has(ROLEIDS.cyberpunk) ||
          member.roles.cache.has(ROLEIDS.hacker) ||
          member.roles.cache.has(ROLEIDS.coder) ||
          member.roles.cache.has(ROLEIDS.leet)
        ) {
          let badge = BADGES.find((badge) => {
            return badge.name === 'Hacker'
          })
          badges.push(`${badge.name} ${badge.emoji}\n`)
        }
        if (immortal.length > 0) {
          if (isImmortal(id)) {
            let badge = BADGES.find((badge) => {
              return badge.name === 'Immortal'
            })
            badges.push(`${badge.name} ${badge.emoji}\n`)
          }
        }
        if (memer) {
          let badge = BADGES.find((badge) => {
            return badge.name === 'Memer'
          })
          badges.push(`${badge.name} ${badge.emoji}\n`)
        }
        if (patron) {
          let badge = BADGES.find((badge) => {
            return badge.name === 'Patron'
          })
          badges.push(`${badge.name} ${badge.emoji}\n`)
        }
        if (haikus && haikus.length >= 50) {
          let badge = BADGES.find((badge) => {
            return badge.name === 'Poet'
          })
          badges.push(`${badge.name} ${badge.emoji}\n`)
        }
        if (psyop) {
          let badge = BADGES.find((badge) => {
            return badge.name === 'PSYOP'
          })
          badges.push(`${badge.name} ${badge.emoji}\n`)
        }
        if (rabbit) {
          let badge = BADGES.find((badge) => {
            return badge.name === 'Rabbit'
          })
          description += ` ${badge.emoji}`
        }

        if (deaths.length > 0) stats.push(`Deaths \`${deaths[0].deaths}\``)
        if (haikus.length > 0) {
          const haiku = haikus[Math.floor(Math.random() * haikus.length)]
          embed.addField('Haiku', `*${haiku.content}*`, false)
          stats.push(`Haikus \`${haikus.length}\``)
        }
        if (badges.length > 0) {
          embed.addField('Badges', badges.join(' '), true)
        }
        if (stats.length > 0) {
          stats.sort()
          embed.addField('Stats', stats.join('\n'), true)
        }
        embed
          .setColor(member.displayHexColor || COLORS.embed)
          .setDescription(description)
          .setThumbnail(member.user.avatarURL())
          .setTitle(rank)

        if (rank.length > 0) embed.setTitle(rank)

        message.channel.send(embed)
      })
    } else if (command === 'resurrect') {
      if (!message.member.roles.cache.has(ROLEIDS.ghost))
        return message.channel.send(`You're not dead.`)

      const embed = new Discord.MessageEmbed()
        .setColor(COLORS.embedBlack)
        .setTitle(`Resurrection 🙏`)
      const matches = Resurrection.find()
        .matches('uid', message.author.id)
        .run()
      const hasResurrected = matches.length > 0
      let timeRemaining

      if (hasResurrected) {
        const expires = matches[0]._ts_ + 3 * 24 * 60 * 60 * 1000
        if (Date.now() < expires) timeRemaining = expires - Date.now()
      }

      if (!timeRemaining) {
        message.member.roles.remove(ROLEIDS.ghost)
        if (hasResurrected) Resurrection.remove(matches[0]._id_)
        Resurrection.add({ uid: message.author.id })
        embed.setDescription(`You have been resurrected.`)
      } else {
        embed.setDescription(
          `You have to wait \`${prettyMs(timeRemaining)}\` to resurrect.`
        )
      }
      return message.channel.send(embed)
    } else if (command === 'ressurrect' || command === 'ressurect') {
      message.channel.send(`Did you mean \`!resurrect\`? 😉`)
    } else if (command === 'stats') {
      const acronyms = Meta.find().matches('name', 'acronyms').run()
      const bandnames = Meta.find().matches('name', 'bandnames').run()
      const deaths = Death.find().run()
      const memes = Meta.find().matches('name', 'memes').run()
      const oc = Meta.find().matches('name', 'oc').run()
      const stimulus = Meta.find().matches('name', 'stimulus').run()

      let countAcronyms = 0
      acronyms.forEach((user) => {
        if (!isNaN(user.value))
          countAcronyms = countAcronyms + parseInt(user.value)
      })
      let countBandNames = 0
      bandnames.forEach((user) => {
        countBandNames = countBandNames + parseInt(user.value)
      })

      const countBios = Bio.find().run().length

      let countDeaths = 0
      deaths.forEach((death) => {
        countDeaths = countDeaths + parseInt(death.deaths)
      })
      let countMemes = 0
      memes.forEach((user) => {
        countMemes = countMemes + parseInt(user.value)
      })
      let countOC = 0
      oc.forEach((user) => {
        countOC = countOC + parseInt(user.value)
      })
      let countStimulus = 0
      stimulus.forEach((user) => {
        countStimulus = countStimulus + parseInt(user.value)
      })

      const countHaikus = Haiku.find().run().length
      const highscore = Meta.find().matches('name', 'counting').limit(1).run()

      let countHighscore = 1

      if (highscore.length > 0)
        countHighscore = highscore[0].value.split('|')[1]

      const statsNumbers =
        `Counting Highscore \`${countHighscore}\`` +
        `\nDeath Toll \`${countDeaths}\`` +
        `\nMemes \`${countMemes}\`` +
        `\nMini-Bios \`${countBios}\`` +
        `\nStimulus \`${countStimulus}\``

      const statsOriginal =
        `Accidental Haikus \`${countHaikus}\`` +
        `\nAcronyms \`${countAcronyms}\`` +
        `\nBand Names \`${countBandNames}\`` +
        `\nCreative Work \`${countOC}\``

      const embed = new Discord.MessageEmbed()
        .setColor(COLORS.embed)
        .setDescription(
          `Some more or *less* useful information. ` +
            `It's less, it's definitely less.`
        )
        .setTitle('Statistics')
        .addFields(
          { name: 'Numbers', value: statsNumbers, inline: true },
          {
            name: 'Original Content',
            value: statsOriginal,
            inline: true,
          }
        )

      message.channel.send(embed)
    } else if (command === 'uptime') {
      message.channel.send(prettyMs(message.client.uptime))
    } else if (command === 'version') {
      message.channel.send(version)
    }
  } else if (message.content.includes(KEY)) {
    message.delete()
    if (message.member.roles.cache.has(ROLEIDS.leet)) {
      message.channel.send('🐇').then((message) => {
        setTimeout(() => {
          message.delete()
        }, timerFeedbackDelete)
      })
    } else {
      message.member.roles.add(ROLEIDS.leet)
      message.channel
        .send('You can now send anonymous messages with `/anon` :rabbit:')
        .then((message) => {
          setTimeout(() => {
            message.delete()
          }, timerFeedbackDelete)
        })
    }
  } else if (message.content.includes(':420:')) {
    message.react(EMOJIIDS.weed)
  } else if (
    message.content.includes('--debug') &&
    message.author.id === IDS.admin
  ) {
    const dataDir = path.resolve(__dirname, 'data')
    const dataBytes = getDirSize(dataDir)
    const dataReadable = formatBytes(dataBytes)

    const haikus = Haiku.find().run()
    const haikusFiltered = haikus.filter((haiku) =>
      message.guild.members.fetch(haiku.uid)
    )

    message.channel.send(`🧠 ${dataReadable}`)
  }
})

client.on('ready', () => {
  console.log(`Holly ${version} is online.`)

  client.user.setPresence({
    status: 'online',
    activity: {
      name: STATUS[Math.floor(Math.random() * STATUS.length)],
      type: 'PLAYING',
    },
  })

  cron.schedule('0 */8 * * *', () => {
    randomAcronym()
    randomLetter()
  })
})

client.ws.on('INTERACTION_CREATE', async (interaction) => {
  const channel = client.channels.cache.get(interaction.channel_id)
  const guild = client.guilds.cache.get(interaction.guild_id)
  const member = guild.members.cache.get(interaction.member.user.id)

  if (interaction.data.name === 'anon') {
    if (member.roles.cache.has(ROLEIDS.leet)) {
      const message = interaction.data.options[0].value
      const randomize = interaction.data.options[1]
      const uid = member.id
      const avatar = Meta.find()
        .matches('name', 'avatar')
        .matches('uid', uid)
        .limit(1)
        .run()
      const embed = new Discord.MessageEmbed()
        .setColor(COLORS.embedBlack)
        .setDescription(`**Anonymous**\n${message}`)

      if (avatar.length > 0)
        embed.setThumbnail(`https://robohash.org/${avatar[0].value}.png`)
      else embed.setThumbnail(`https://robohash.org/${uid}.png`)

      if (randomize && randomize.value === true) {
        const rng = Math.floor(Math.random() * 900000000000000000)

        if (avatar.length > 0) {
          Meta.update(avatar[0]._id_, {
            value: `${rng}`,
          })
        } else {
          Meta.add({
            name: 'avatar',
            uid: uid,
            value: `${rng}`,
          })
        }

        embed.setThumbnail(`https://robohash.org/${rng}.png`)
      }

      channel.send(embed)

      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: `<:anonymous:${EMOJIIDS.anonymous}>`,
            flags: 1 << 6,
          },
        },
      })
    } else {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: 'Down the rabbit hole :rabbit:',
            flags: 1 << 6,
          },
        },
      })
    }
  }
})

client.login()

const http = require('http')
http
  .createServer(function (req, res) {
    res.writeHead(301, { Location: 'https://cyberpunksocial.club' })
    res.end()
  })
  .listen(8080)
