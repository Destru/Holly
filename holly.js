require('dotenv').config()
require('discord-reply')
const Discord = require('discord.js')
const client = new Discord.Client()
const db = require('flat-db')
const cron = require('node-cron')
const fetch = require('node-fetch')
const findahaiku = require('findahaiku')
const paginationEmbed = require('discord.js-pagination')
const prettyMs = require('pretty-ms')
const checkWord = require('check-word')
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
const capitalize = (string) => {
  if (typeof string !== 'string') return string
  return string.charAt(0).toUpperCase() + string.slice(1)
}
const channelId = {
  akihabara: '837824443799175179',
  anything: '462734936177115136',
  acronyms: '866967261092773918',
  allcaps: '412714197399371788',
  anonymous: '848997740767346699',
  bandnames: '867179976444870696',
  comrades: '865757944552488960',
  composing: '843417385444442152',
  contest: '875207790468153386',
  counting: '827487959241457694',
  gallery: '877484284519264296',
  graveyard: '832394205422026813',
  hornyjail: '841057992890646609',
  illustrating: '843417452787662848',
  internal: '845382463685132288',
  irl: '414177882865401866',
  memes: '415948136759164928',
  nsfw: '362316618044407819',
  releases: '352149516885164044',
  stimulus: '419929465989234720',
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
const CSC = '160320676580818951'
const COLORS = {
  embed: '#FF00FF',
  embedBlack: '#2F3136',
}
const HOLLY = '301275924098449408'
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
const randomChance = 0.02
const randomEmoji = () => {
  const emoji = [
    '<:cscalt:837251418247004205>',
    '<:cscbob:846528128524091422>',
    '<:csc:403256716583632906>',
  ]
  return emoji[Math.floor(Math.random() * emoji.length)]
}
const randomAcronym = () => {
  const channel = client.channels.cache.get(channelId.acronyms)
  const matches = Meta.find().matches('name', 'acronyms').limit(1).run()

  const acronyms =
    'csc acab cccp cia fbi kgb nasa nsa lol omg wtf afk brb mcd kfc bbq lmao'.split(
      ' '
    )
  let acronym = acronyms[Math.floor(Math.random() * acronyms.length)]

  console.log(acronym)

  if (matches.length > 0) {
    while (acronym === matches[0].value) {
      acronym = acronyms[Math.floor(Math.random() * acronyms.length)]
    }
    Meta.update(matches[0]._id_, { value: acronym })
  } else {
    Meta.add({ name: 'acronyms', value: acronym })
  }

  channel.setTopic(
    `${alphabetEmoji[acronym.charCodeAt(0) - 97]} ${
      alphabetEmoji[acronym.charCodeAt(1) - 97]
    } ${alphabetEmoji[acronym.charCodeAt(2) - 97]}
    :skull:`
  )
}
const randomLetter = () => {
  const channel = client.channels.cache.get(channelId.wordwar)
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
const roleGhost = '832393909988491304'
const setReactions = (message, type = false) => {
  switch (type) {
    case 'csc':
      message.react('837251418247004205')
      message.react('875259618119536701')
      break
    case 'updown':
      if (message.channel.id === channelId.memes)
        message.react('830114281168699412')
      else message.react('462126280704262144')
      message.react('462126761098870784')
      break
    default:
      message.react('875259618119536701')
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
    const channelGraveyard = client.channels.cache.get(channelId.graveyard)
    const obituary = new Discord.MessageEmbed()
      .setColor(COLORS.embedBlack)
      .setThumbnail(message.author.avatarURL())
      .setTitle(`${message.author.username}`)
      .setDescription(`Died in ${message.channel} :headstone:`)

    if (!isImmortal(message.author.id)) {
      if (message) message.react('💀')
      message.member.roles.add(roleGhost)
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

  if (!message.author.bot && isHaiku) {
    const poet =
      message.channel.id === '412714197399371788'
        ? message.author.username.toUpperCase()
        : message.author.username
    const embed = new Discord.MessageEmbed()
      .setColor(COLORS.embed)
      .setDescription(`${formattedHaiku}\n—*${poet}*`)

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
    if (message.channel.id === '405503298951446528') {
      // #terminal
      if (message.author.id === '844980040579678259') {
        // Queeg
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
          message.channel.send(
            `The \`!immortal\` has been found and wounded for \`${penalty}\` points.`
          )
        }
      } else if (message.author.id === '836661328374267997') {
        // HAL9000
        const matches = message.content.match(
          /<@(\d+)> has reached level (\d+)/
        )
        const promotionChannel =
          message.client.channels.cache.get('160320676580818951')

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

            embed.setDescription(description).setTitle('Promotion')

            message.guild.members.fetch(id).then((member) => {
              embed
                .setAuthor(member.user.username, member.user.avatarURL())
                .setColor(member.displayHexColor)
                .setThumbnail(member.user.avatarURL())
              promotionChannel.send(embed).then((message) => {
                setReactions(message, 'csc')
              })
            })
          }
        }
      }
    } else if (message.channel.id === '833098945668186182') {
      // #jeopardy
      if (
        message.author.id === '400786664861204481' &&
        Math.random() < randomChance
      ) {
        fetch('https://insult.mattbas.org/api/insult.json')
          .then((response) => response.json())
          .then((data) => {
            message.channel.send(`${data.insult}, ${message.author}`)
          })
      }
    }
    return
  } else if (message.channel.id === channelId.acronyms) {
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
  } else if (message.channel.id === channelId.anonymous) {
    message.react('❌')
    permaDeath()
  } else if (message.channel.id === channelId.allcaps) {
    const allCaps = /^[A-Z0-9\s-_,./?;:'"‘’“”`~!@#$%^&*()=+|\\<>\[\]{}]+$/gm

    if (!message.content.match(allCaps)) {
      message.react('❌')
      permaDeath()
    } else permaDeathScore()
  } else if (message.channel.id === channelId.bandnames) {
    setReactions(message, 'updown')
  } else if (
    message.channel.id === channelId.comrades ||
    message.channel.id === channelId.contest
  ) {
    const embed = new Discord.MessageEmbed()
      .setColor(COLORS.embed)
      .setTitle(`Warning`)

    let matches

    if (message.channel.id === channelId.comrades) {
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
      if (message.channel.id === channelId.comrades) {
        setReactions(message, 'csc')
        Bio.add({
          uid: message.author.id,
          url: message.url,
        })
      } else {
        message.react('462126280704262144')
        Entry.add({
          uid: message.author.id,
          url: message.url,
        })
      }
    }
  } else if (message.channel.id === channelId.counting) {
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
    message.channel.id === channelId.memes ||
    message.channel.id === channelId.stimulus
  ) {
    if (
      message.content.includes('http://') ||
      message.content.includes('https://') ||
      message.attachments.size > 0
    ) {
      setReactions(message, 'updown')
    }
  } else if (
    message.channel.id === channelId.nsfw ||
    message.channel.id === channelId.irl
  ) {
    setReactions(message)
  } else if (message.channel.id === channelId.wordwar) {
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
    message.channel.id === channelId.akihabara ||
    message.channel.id === channelId.hornyjail
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
        if (message.channel.id === '841057992890646609') type = 'nsfw'
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
      channelId.anything,
      channelId.comrades,
      channelId.composing,
      channelId.gallery,
      channelId.illustrating,
      channelId.releases,
      channelId.writing,
    ].includes(message.channel.id)
  ) {
    if (
      message.content.includes('http://') ||
      message.content.includes('https://') ||
      message.attachments.size > 0
    ) {
      setReactions(message, 'csc')
    }
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
    message.channel.send(embed)
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

    message.channel.send(embed)
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
      message.channel.send(embed)
    }
  } else if (command === 'deploy') {
    if (message.member.roles.cache.has('832089472337182770')) {
      if (version === '(Development)') {
        client.api
          .applications(client.user.id)
          .guilds(CSC)
          .commands.get()
          .then((commands) => {
            client.api
              .applications(client.user.id)
              .guilds(CSC)
              .commands(commands[0].id)
              .delete()
          })
      } else {
        client.api
          .applications(client.user.id)
          .guilds(CSC)
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
    } else message.channel.send('No access.')
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

            paginationEmbed(message, pages)
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
            message.channel.send(embed)
          })
        }
      } else return message.channel.send(`No haikus found.`)
    }
  } else if (command === 'letter') {
    const matches = Meta.find().matches('name', 'word-war').limit(1).run()

    if (matches.length > 0)
      message.channel.send(alphabetEmoji[alphabet.indexOf(matches[0].value)])
  } else if (command === 'immortal') {
    const embed = new Discord.MessageEmbed()
    const immortals = Immortal.find().run()

    if (immortals.length > 0) {
      const immortalsSorted = immortals.sort((a, b) => a.score - b.score)
      const immortal = immortalsSorted.pop()

      if (immortal && immortal.uid && immortal.score) {
        embed.setDescription(
          `\`${immortal.score}\` points <:baphomet:866887258892140574>` +
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
      message.channel.send(embed)
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
        member.roles.cache.has('412545631228395540') ||
        member.roles.cache.has('832089472337182770')
      const bio = Bio.find().matches('uid', id).limit(1).run()[0] || false
      const deaths = Death.find().matches('uid', id).limit(1).run()
      const haikus = Haiku.find().matches('uid', id).run()
      const immortal = Immortal.find().matches('uid', id).limit(1).run()
      const patreon = member.roles.cache.has('824015992417419283')
      const twitch = member.roles.cache.has('444074281694003210')
      const memberFor = Date.now() - member.joinedAt.getTime()

      let badges = []
      let description = `Member for \`${prettyMs(memberFor)}\` `
      let permadeath = []

      if (admin) badges.push('<:cscalt:837251418247004205>')
      if (patreon) badges.push('<:patreon:837291787797135360>')
      if (twitch) badges.push('<:twitch:847500070373818379>')

      if (deaths.length > 0) permadeath.push(`Deaths \`${deaths[0].deaths}\``)
      if (immortal.length > 0) {
        let points = `Points \`${immortal[0].score}\``
        if (isImmortal(immortal[0].uid))
          points += ' <:baphomet:866887258892140574>'
        permadeath.push(points)
      }

      if (bio) description += `\n[Mini Biography](${bio.url})`
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

      message.channel.send(embed)
    })
  } else if (command === 'random') {
    if (message.member.roles.cache.has('832089472337182770')) {
      randomAcronym()
      randomLetter()
    } else return message.channel.send(`You don't have the clearance for that.`)
  } else if (command === 'resurrect' || command === 'ressurect') {
    if (!message.member.roles.cache.has(roleGhost))
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
      message.member.roles.remove(roleGhost)
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

  cron.schedule('0 */6 * * *', () => {
    randomAcronym()
    randomLetter()
  })
})

client.ws.on('INTERACTION_CREATE', async (interaction) => {
  if (interaction.data.name === 'anon') {
    const channel = client.channels.cache.get(channelId.anonymous)
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
