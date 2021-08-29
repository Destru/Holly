require('dotenv').config()
require('discord-reply')
const Discord = require('discord.js')
const fs = require('fs')
const client = new Discord.Client()
const db = require('flat-db')
const cron = require('node-cron')
const fetch = require('node-fetch')
const findahaiku = require('findahaiku')
const paginationEmbed = require('discord.js-pagination')
const prettyMs = require('pretty-ms')
const checkWord = require('check-word')
const { authenticate, terminal } = require('./terminal')
const dictionary = checkWord('en')

const akihabara = [
  'awoo',
  'bite',
  'blowjob',
  'blush',
  'bonk',
  'bully',
  'cringe',
  'cuddle',
  'cry',
  'dance',
  'glomp',
  'handhold',
  'happy',
  'highfive',
  'hug',
  'kick',
  'kill',
  'kiss',
  'lick',
  'megumin',
  'neku',
  'nom',
  'pat',
  'poke',
  'shinobu',
  'slap',
  'smile',
  'smug',
  'trap',
  'waifu',
  'wave',
  'wink',
  'yeet',
]
const alphabet = 'abcdefghijklmnopqrstuvwxyz'
const alphabetEmoji =
  '🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿'.split(
    ' '
  )
const BADGES = [
  {
    name: 'Anonymous',
    description: 'Custom avatar for anonymous chat',
    emoji: '<:anonymous:837247849145303080>',
  },
  {
    name: 'Comrade',
    description: 'Written a mini biography.',
    emoji: '<:cscalt:837251418247004205>',
  },
  {
    name: 'Immortal',
    description: 'An immortal being.',
    emoji: '<:tst:866886790920405032>',
  },
  {
    name: 'Operator',
    description: 'Member of the *CSC* administration',
    emoji: '<:cscbob:846528128524091422>',
  },
  {
    name: 'Patron',
    description: 'Super cool *Patreon* supporter',
    emoji: '<:patreon:837291787797135360>',
  },
  {
    name: 'PSYOP',
    description: 'Awesome and rad *Twitch* subscriber',
    emoji: '<:twitch:879932370210414703>',
  },
  {
    name: 'Rabbit',
    description: 'Jrag qbja gur enoovg ubyr',
    emoji: '[🐰](https://github.com/Destru/Holly/blob/master/key.md)',
  },
]
const capitalize = (string) => {
  if (typeof string !== 'string') return string
  return string.charAt(0).toUpperCase() + string.slice(1)
}
const CHANNELIDS = {
  akihabara: '837824443799175179',
  anything: '462734936177115136',
  acronyms: '866967261092773918',
  allcaps: '412714197399371788',
  anonymous: '848997740767346699',
  bandnames: '867179976444870696',
  chat: '160320676580818951',
  comrades: '865757944552488960',
  composing: '843417385444442152',
  contest: '875207790468153386',
  counting: '827487959241457694',
  gallery: '877484284519264296',
  graveyard: '832394205422026813',
  halloffame: '880299507936534598',
  hornyjail: '841057992890646609',
  illustrating: '843417452787662848',
  internal: '845382463685132288',
  irl: '414177882865401866',
  jeopardy: '833098945668186182',
  memes: '415948136759164928',
  nsfw: '362316618044407819',
  releases: '352149516885164044',
  saferspace: '830131461000658994',
  stimulus: '419929465989234720',
  terminal: '405503298951446528',
  wordwar: '866967592622489640',
  writing: '843417014756179978',
}
const complimentChannels = ['836963196916858902', '841057992890646609']
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
const countLeaderboard = 5
const COLORS = {
  embed: '#FF00FF',
  embedBlack: '#2F3136',
}
const EMOJIIDS = {
  csc: '837251418247004205',
  kekw: '830114281168699412',
  heart: '875259618119536701',
  upvote: '462126280704262144',
}
const IDS = {
  csc: '160320676580818951',
  hal9000: '836661328374267997',
  holly: '301275924098449408',
  queeg: '844980040579678259',
  trebek: '400786664861204481',
}
const isImmortal = (id) => {
  const immortal = Immortal.find()
    .run()
    .sort((a, b) => a.score - b.score)
    .pop()
  if (immortal && immortal.uid === id) return true
  else return false
}
const perPage = 5
const quotes = [
  `Rude alert! Rude alert! An electrical fire has knocked out my voice recognition unicycle! Many Wurlitzers are missing from my database.`,
  `We have enough food to last thirty thousand years, but we've only got one Milk Dud left. And everyone's too polite to take it.`,
  `Our deepest fear is going space crazy through loneliness. The only thing that helps me keep my slender grip on reality is the friendship I have with my collection of anime waifus.`,
  `Well, the thing about a black hole, its main distinguishing feature, is it's black. And the thing about space, the colour of space, your basic space colour, is black. So how are you supposed to see them?`,
]
const randomAcronym = () => {
  const channel = client.channels.cache.get(CHANNELIDS.acronyms)
  const csc = 'csc '.repeat(50)
  const matches = Meta.find().matches('name', 'acronyms').limit(1).run()
  const rare =
    'acab cccp cia fbi kgb nasa nsa ' + 'lol omg wtf afk brb mcd kfc bbq lmao '

  let acronyms = `${csc} ${rare}`.split(' ')
  let acronym = acronyms[Math.floor(Math.random() * acronyms.length)]
  let topic = ``

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
const randomChance = 0.03
const randomEmoji = () => {
  const emoji = [
    '<:cscalt:837251418247004205>',
    '<:cscbob:846528128524091422>',
    '<:csc:403256716583632906>',
  ]
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
  60: 'Tron',
}
const ROLEIDS = {
  tron: '832402366698618941',
  cyberpunk: '419210958603419649',
  replicant: '832401876024295424',
  android: '832401705039691817',
  cyborg: '349225708821676033',
  augmented: '832400605947363360',
  revolutionary: '414205618077827102',
  insurgent: '832400140651462656',
  activist: '348980130292695040',
  comrade: '422282829494484992',
  admin: '832089472337182770',
  ghost: '832393909988491304',
  hehim: '872843239009431664',
  leet: '879993290877984818',
  operator: '412545631228395540',
  sheher: '872843238657110076',
  theythem: '872843238208319529',
  patron: '824015992417419283',
  pronons: '872843237344288779',
  psyop: '444074281694003210',
  voter: '827915811724460062',
}
const setReactions = (message, type = false) => {
  switch (type) {
    case 'csc':
      message.react(EMOJIIDS.csc)
      message.react(EMOJIIDS.heart)
      break
    case 'upvote':
      if (message.channel.id === CHANNELIDS.memes) message.react(EMOJIIDS.kekw)
      else message.react(EMOJIIDS.upvote)
      break
    case 'heart':
    default:
      message.react(EMOJIIDS.heart)
  }
}
const status = [
  'Back to Reality',
  'Better Than Life',
  'Gunmen of the Apocalypse',
  'Play-by-mail Chess',
]
const subjectId = (message) => {
  const matches = message.content.match(/<@!(\d+)>/)
  let id = message.author.id
  if (matches) id = matches[1]
  return id
}
const timerFeedbackDelete = 5000
const version = process.env.npm_package_version || '(Development)'

let KEY
fs.readFile('./key.md', 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  KEY = data.trim()
})

db.configure({ dir: './db' })

const Bio = new db.Collection('bios', {
  uid: '',
  url: '',
})
const Death = new db.Collection('deaths', {
  uid: '',
  deaths: '',
})
const Entry = new db.Collection('entries', {
  uid: '',
  url: '',
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
      .setTitle(`${message.author.username}`)
      .setDescription(`Died in ${message.channel} :headstone:`)

    if (!isImmortal(message.author.id)) {
      if (message) message.react('💀')
      message.member.roles.add(ROLEIDS.ghost)
      channelGraveyard.send(obituary)
      permaDeathScore(true)
    } else {
      permaDeathScore(false, Math.floor(Math.random() * 42) + 1)
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

      Immortal.remove(immortal._id_)
    } else {
      if (penalty > 0) {
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

  if (message.guild === null) {
    client.guilds.cache
      .get(IDS.csc)
      .members.fetch(message.author.id)
      .then((member) => {
        if (member.roles.cache.has(ROLEIDS.leet)) {
          terminal(message, client)
        } else {
          return message.author.send(`No access. :rabbit2:`)
        }
      })
  } else if (
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

  if (
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

  if (message.author.bot) {
    if (message.channel.id === CHANNELIDS.terminal) {
      if (message.author.id === IDS.queeg) {
        const matches = message.content.match(/Running daily tasks\./)
        if (matches) {
          const immortal = Immortal.find()
            .run()
            .sort((a, b) => a.score - b.score)
            .pop()

          const currentScore = parseInt(immortal.score)
          const penalty = Math.floor(Math.random() * (currentScore / 2)) + 1

          if (penalty > currentScore) penalty = currentScore - 1

          Immortal.update(immortal._id_, {
            score: `${currentScore - penalty}`,
          })

          let points = 'points'
          if (penalty === 1) points = 'point'

          message.channel.send(
            `The \`!immortal\` has been found and wounded for \`${penalty}\` ${points}.`
          )
        }
      } else if (message.author.id === IDS.hal9000) {
        const matches = message.content.match(
          /<@(\d+)> has reached level (\d+)/
        )
        const promotionChannel = message.client.channels.cache.get(
          CHANNELIDS.chat
        )

        if (matches) {
          const level = parseInt(matches[2])

          fetch(`https://api.waifu.pics/sfw/dance`)
            .then((response) => response.json())
            .then((data) => {
              message.channel.send(data.url)
            })

          if (ranks[level]) {
            const id = matches[1]
            const embed = new Discord.MessageEmbed()

            let adjective = `a contributing`

            if (level >= 50) adjective = `a *godlike*`
            else if (level >= 40) adjective = `an inspiring`
            else if (level >= 30) adjective = `a prolific`
            else if (level >= 20) adjective = `an important`

            let description =
              `Has been promoted to **${ranks[level]}** ${randomEmoji()}` +
              `\n\nThank you for being ${adjective} member of this community. `

            switch (level) {
              case 5:
                description +=
                  `You're now considered a comrade, ` +
                  `and have been granted access to \`Limited\` channels. `
                break
              case 10:
                description +=
                  `You can now post in <#352149516885164044>, ` +
                  `and will receive the \`Live\` role when you stream. `
                break
              case 15:
                description +=
                  `You've unlocked an even <#830131461000658994> ` +
                  `with anonynomous confessions. `
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
    } else if (
      message.channel.id === CHANNELIDS.jeopardy &&
      message.author.id === IDS.trebek &&
      Math.random() < randomChance
    ) {
      fetch('https://insult.mattbas.org/api/insult.json')
        .then((response) => response.json())
        .then((data) => {
          message.channel.send(`${data.insult}, ${message.author}`)
        })
    }
    return
  } else if (message.channel.id === CHANNELIDS.acronyms) {
    const matches = Meta.find().matches('name', 'acronyms').limit(1).run()
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
      } else {
        message.react('❌')
        permaDeath()
      }
    }
  } else if (message.channel.id === CHANNELIDS.anonymous) {
    message.react('❌')
    permaDeath()
  } else if (message.channel.id === CHANNELIDS.allcaps) {
    const allCaps = /^[A-Z0-9\s-_,./?;:'"‘’“”`~!@#$%^&*()=+|\\<>\[\]{}]+$/gm

    if (!message.content.match(allCaps)) {
      message.react('❌')
      permaDeath()
    } else permaDeathScore()
  } else if (message.channel.id === CHANNELIDS.bandnames) {
    setReactions(message, 'upvote')
  } else if (
    message.channel.id === CHANNELIDS.comrades ||
    message.channel.id === CHANNELIDS.contest
  ) {
    const embed = new Discord.MessageEmbed()
      .setColor(COLORS.embed)
      .setTitle(`Warning`)

    let matches

    if (message.channel.id === CHANNELIDS.comrades) {
      matches = Bio.find().matches('uid', message.author.id).limit(1).run()
    } else {
      matches = Entry.find().matches('uid', message.author.id).limit(3).run()
    }

    if (matches.length >= 3) {
      if (message) message.delete()
      embed.setDescription(
        `You're only allowed three (\`3\`) posts in this channel.` +
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
      if (message.channel.id === CHANNELIDS.comrades) {
        setReactions(message, 'heart')
        Bio.add({
          uid: message.author.id,
          url: message.url,
        })
      } else {
        setReactions(message, 'upvote')
        Entry.add({
          uid: message.author.id,
          url: message.url,
        })
      }
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
    message.channel.id === CHANNELIDS.memes ||
    message.channel.id === CHANNELIDS.stimulus
  ) {
    if (
      message.content.includes('http://') ||
      message.content.includes('https://') ||
      message.attachments.size > 0
    ) {
      setReactions(message, 'upvote')
    }
  } else if (
    message.channel.id === CHANNELIDS.nsfw ||
    message.channel.id === CHANNELIDS.irl
  ) {
    setReactions(message, 'heart')
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
    message.channel.id === CHANNELIDS.akihabara ||
    message.channel.id === CHANNELIDS.hornyjail
  ) {
    // #akihabara + #horny-jail
    if (akihabara.includes(command)) {
      let type = 'sfw'

      if (
        command === 'blowjob' ||
        command === 'neko' ||
        command === 'trap' ||
        command === 'waifu'
      ) {
        if (message.channel.id === CHANNELIDS.hornyjail) type = 'nsfw'
        else {
          if (command === 'blowjob' || command === 'trap') {
            command = 'bonk'
          }
        }
      }

      fetch(`https://api.waifu.pics/${type}/${command}`)
        .then((response) => response.json())
        .then((data) => {
          message.channel.send(data.url)
        })
    }
  } else if (
    [
      CHANNELIDS.anything,
      CHANNELIDS.comrades,
      CHANNELIDS.composing,
      CHANNELIDS.gallery,
      CHANNELIDS.illustrating,
      CHANNELIDS.releases,
      CHANNELIDS.writing,
    ].includes(message.channel.id)
  ) {
    if (
      message.content.includes('http://') ||
      message.content.includes('https://') ||
      message.attachments.size > 0
    ) {
      setReactions(message, 'csc')
    }
  } else if (command === 'badges') {
    const embed = new Discord.MessageEmbed()
      .setColor(COLORS.embed)
      .setTitle('Badges')

    let badges = []

    BADGES.forEach((badge) => {
      badges.push(`${badge.name} ${badge.emoji}`)
    })

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
  } else if (command === 'commands') {
    const embed = new Discord.MessageEmbed()
      .setColor(COLORS.embed)
      .setDescription(quotes[Math.floor(Math.random() * quotes.length)])
      .setTitle('Commands')
      .addFields(
        {
          name: 'Community <:cscbob:846528128524091422>',
          value: '`/anon`\n`!haikus`\n`!profile`\n`!resurrect`\n`!stats`',
          inline: true,
        },
        {
          name: 'Permadeath :skull:',
          value: '`!deaths`\n`!immortal`\n`!permadeath`\n`!points`',
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
      .setDescription(
        `There have been \`${deathCount}\` recorded deaths :headstone:`
      )
      .setTitle(`Deaths`)

    if (deaths.length > 0) {
      const deathsSorted = deaths.sort((a, b) => a.deaths - b.deaths)
      const deathsRanked = deathsSorted.reverse()

      let entries =
        deaths.length > countLeaderboard ? countLeaderboard : deaths.length
      let leaderboard = []

      for (let i = 0; i < entries; i++) {
        const score = deathsRanked[i].deaths
        const user = `<@${deathsRanked[i].uid}>`

        leaderboard.push(`\`${i + 1}.\` ${user} \`${score}\``)
      }
      embed.addField('Leaderboard', leaderboard.join('\n'), false)
      message.guild.members.fetch(deathsRanked[0].uid).then((member) => {
        embed.setThumbnail(member.user.avatarURL())
        return message.channel.send(embed)
      })
    }
  } else if (command === 'deploy') {
    if (message.member.roles.cache.has(ROLEIDS.admin)) {
      if (version === '(Development)') {
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
      } else {
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
        message.channel.send('Deployment successful.')
      }
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
              displayHaikus += `${haiku.content}` + `\n<#${haiku.channel}>\n\n`
            })

            embed.setDescription(displayHaikus)
            return message.channel.send(embed)
          })
        }
      } else return message.channel.send(`No haikus found.`)
    }
  } else if (command === 'immortal') {
    const embed = new Discord.MessageEmbed()
    const immortals = Immortal.find().run()

    if (immortals.length > 0) {
      const immortalsSorted = immortals.sort((a, b) => a.score - b.score)
      const immortal = immortalsSorted.pop()

      if (immortal && immortal.uid && immortal.score) {
        embed.setDescription(
          `\`${immortal.score}\` points <:tst:866886790920405032>` +
            `\n\nBow before our ruler; an immortal being. ` +
            `Bathe in their light and unfathomable beauty, ` +
            `and *accept* their judgement.`
        )

        message.guild.members.fetch(immortal.uid).then((member) => {
          embed
            .setColor(member.displayHexColor)
            .setThumbnail(member.user.avatarURL())
            .setTitle(member.displayName)
          message.channel.send(embed)
        })
      }
    } else {
      return message.channel.send(
        `There is currently no immortal being present on the server ${randomEmoji()}`
      )
    }
  } else if (command === 'letter') {
    const matches = Meta.find().matches('name', 'word-war').limit(1).run()

    if (matches.length > 0)
      return message.channel.send(
        alphabetEmoji[alphabet.indexOf(matches[0].value)]
      )
  } else if (command === 'age') {
    const id = subjectId(message)

    message.guild.members.fetch(id).then((member) => {
      const memberFor = Date.now() - member.joinedAt.getTime()
      return message.lineReply(`Member age \`${prettyMs(memberFor)}\``)
    })
  } else if (command === 'permadeath') {
    const embed = new Discord.MessageEmbed()
      .setColor(COLORS.embedBlack)
      .setDescription(
        `Contributing in :skull: channels awards points. ` +
          `Points reset on death. ` +
          `Whoever has the most points is \`!immortal\` and will be hunted.`
      )
      .setTitle(`Permadeath`)

    const immortals = Immortal.find().run()

    if (immortals.length > 0) {
      const immortalsSorted = immortals.sort((a, b) => a.score - b.score)
      const immortalRanked = immortalsSorted.reverse()

      let entries =
        immortals.length > countLeaderboard
          ? countLeaderboard
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

      let badges = []
      let description = ''
      let permadeath = [],
        pronouns = '',
        rank = ''

      if (member.roles.cache.has(ROLEIDS.tron)) rank = `Tron`
      else if (member.roles.cache.has(ROLEIDS.cyberpunk)) rank = `Cyberpunk`
      else if (member.roles.cache.has(ROLEIDS.replicant)) rank = `Replicant`
      else if (member.roles.cache.has(ROLEIDS.android)) rank = `Android`
      else if (member.roles.cache.has(ROLEIDS.cyborg)) rank = `Cyborg`
      else if (member.roles.cache.has(ROLEIDS.augmented)) rank = `Augmented`
      else if (member.roles.cache.has(ROLEIDS.revolutionary))
        rank = `Revolutionary`
      else if (member.roles.cache.has(ROLEIDS.insurgent)) rank = `Insurgent`
      else if (member.roles.cache.has(ROLEIDS.activist)) rank = `Activist`
      else if (member.roles.cache.has(ROLEIDS.comrade)) rank = `Comrade`

      if (member.roles.cache.has(ROLEIDS.hehim)) pronouns += `\`He/Him\` `
      if (member.roles.cache.has(ROLEIDS.sheher)) pronouns += `\`She/Her\` `
      if (member.roles.cache.has(ROLEIDS.theythem)) pronouns += `\`They/Them\` `
      if (member.roles.cache.has(ROLEIDS.pronouns))
        pronouns = `\`Pronouns: Ask\``
      if (pronouns.length > 0) {
        description += `${pronouns} \`${prettyMs(memberFor, {
          compact: true,
        })}\``
      } else {
        description += `\`${prettyMs(memberFor)}\``
      }

      if (bio) {
        let badge = BADGES.find((badge) => {
          return badge.name === 'Comrade'
        })
        badges.push(`[${badge.emoji}](${bio.url})`)
      }
      if (admin) {
        let badge = BADGES.find((badge) => {
          return badge.name === 'Operator'
        })
        badges.push(badge.emoji)
      }
      if (avatar) {
        let badge = BADGES.find((badge) => {
          return badge.name === 'Anonymous'
        })
        badges.push(badge.emoji)
      }
      if (patron) {
        let badge = BADGES.find((badge) => {
          return badge.name === 'Patron'
        })
        badges.push(badge.emoji)
      }
      if (psyop) {
        let badge = BADGES.find((badge) => {
          return badge.name === 'PSYOP'
        })
        badges.push(badge.emoji)
      }
      if (rabbit) {
        let badge = BADGES.find((badge) => {
          return badge.name === 'Rabbit'
        })
        description = `${description} ${badge.emoji}`
      }

      if (deaths.length > 0) permadeath.push(`Deaths \`${deaths[0].deaths}\``)
      if (immortal.length > 0) {
        if (isImmortal(id)) {
          let badge = BADGES.find((badge) => {
            return badge.name === 'Immortal'
          })
          badges.push(badge.emoji)
        }
        permadeath.push(`Points \`${immortal[0].score}\``)
      }
      if (haikus.length > 0) {
        const haiku = haikus[Math.floor(Math.random() * haikus.length)]
        embed.addField('Haiku', `*${haiku.content}*`, false)
      }

      if (badges.length > 0) embed.addField('Badges', badges.join(' '), true)
      if (permadeath.length > 0)
        embed.addField('Permadeath', permadeath.join(' '), true)

      embed
        .setColor(member.displayHexColor || COLORS.embed)
        .setDescription(description)
        .setThumbnail(member.user.avatarURL())
        .setTitle(member.displayName)

      if (rank.length > 0) embed.setTitle(`${rank} ${member.displayName}`)

      message.channel.send(embed)
    })
  } else if (command === 'resurrect' || command === 'ressurect') {
    if (!message.member.roles.cache.has(ROLEIDS.ghost))
      return message.channel.send(`You're not dead.`)

    const embed = new Discord.MessageEmbed()
      .setColor(COLORS.embedBlack)
      .setTitle(`Resurrection`)
    const matches = Resurrection.find().matches('uid', message.author.id).run()
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
      embed.setDescription(`You have been resurrected 🙏`)
    } else {
      embed.setDescription(
        `You have to wait \`${prettyMs(timeRemaining)}\` to resurrect.`
      )
    }
    return message.channel.send(embed)
  } else if (command === 'stats') {
    const countBios = Bio.find().run().length
    const countEntries = Entry.find().run().length
    const deaths = Death.find().run()

    let countDeaths = 0
    deaths.forEach((death) => {
      countDeaths = countDeaths + parseInt(death.deaths)
    })

    const countHaikus = Haiku.find().run().length
    const highscore = Meta.find().matches('name', 'counting').limit(1).run()

    let countHighscore = 1

    if (highscore.length > 0) countHighscore = highscore[0].value.split('|')[1]

    const statsNumbers =
      `Counting Highscore \`${countHighscore}\`` +
      `\nDeath Count \`${countDeaths}\``

    const statsOriginal =
      `Accidental Haikus \`${countHaikus}\`` +
      `\nBiographies \`${countBios}\`` +
      `\nContest Entries \`${countEntries}\``

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
  } else if (command === 'version') {
    message.channel.send(version)
  } else if (message.content.includes(KEY)) {
    message.delete()
    if (message.member.roles.cache.has(ROLEIDS.leet)) {
      message.channel.send('🐇').then((message) => {
        setTimeout(() => {
          message.delete()
        }, timerFeedbackDelete)
      })
    } else {
      message.delete()
      message.member.roles.add(ROLEIDS.leet)
      message.channel
        .send('https://c.tenor.com/bWNecnNqh2MAAAAC/hole-rabbit-hole.gif')
        .then((message) => {
          setTimeout(() => {
            message.delete()
          }, timerFeedbackDelete * 2)
        })
      message.channel.send(`Authenticating with \`${KEY}\``).then((message) => {
        setTimeout(() => {
          message.delete()
          message.channel
            .send('`SIGACK` received, terminal unlocked...')
            .then((message) => {
              setTimeout(() => {
                message.delete()
                authenticate(message.member)
              }, timerFeedbackDelete / 2)
            })
        }, timerFeedbackDelete)
      })
    }
  }
})

client.on('ready', () => {
  console.log(`Holly ${version} is online.` + `\nKey: ${KEY}`)

  client.user.setPresence({
    status: 'online',
    activity: {
      name: status[Math.floor(Math.random() * status.length)],
      type: 'PLAYING',
    },
  })

  cron.schedule('0 */6 * * *', () => {
    randomAcronym()
    randomLetter()
  })
})

client.ws.on('INTERACTION_CREATE', async (interaction) => {
  if (interaction.data.name === 'anon') {
    const channel = client.channels.cache.get(CHANNELIDS.anonymous)
    const message = interaction.data.options[0].value
    const randomize = interaction.data.options[1]
    const uid = interaction.member.user.id
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
      const rng = Math.floor(Math.random() * 18)

      if (avatar.length > 0) {
        Meta.update(avatar[0]._id_, {
          value: rng,
        })
      } else {
        Meta.add({
          name: 'avatar',
          uid: uid,
          value: rng,
        })
      }

      embed.setThumbnail(`https://robohash.org/${rng}.png`)
    }

    channel.send(embed)

    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          content: 'Message posted <:anonymous:837247849145303080>',
          flags: 1 << 6,
        },
      },
    })
  }
})

client.login()
