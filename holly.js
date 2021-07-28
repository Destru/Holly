require('dotenv').config()
require('discord-reply')
const Discord = require('discord.js')
const client = new Discord.Client()
const db = require('flat-db')
const fetch = require('node-fetch')
const findahaiku = require('findahaiku')
const prettyMs = require('pretty-ms')
const checkWord = require('check-word')
const dictionary = checkWord('en')

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
const embedColor = '#FF00FF'
const embedColorBlack = '#2F3136'
const immortalChannel = '405503298951446528'
const insultUsers = ['400786664861204481']
const isImmortal = (id) => {
  const immortal = Immortal.find()
    .run()
    .sort((a, b) => a.score - b.score)
    .pop()
  if (immortal.uid === id) return true
  else return false
}
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
const status = [
  'Back to Reality',
  'Better Than Life',
  'Gunmen of the Apocalypse',
  'Play-by-mail Chess',
]
const version = process.env.npm_package_version || '(Development)'

let csc

db.configure({ dir: './db' })
const Avatar = new db.Collection('avatars', {
  uid: '',
  name: '',
  seed: '',
  style: '',
})
const Bio = new db.Collection('bios', {
  uid: '',
  url: '',
})
const Deaths = new db.Collection('deaths', {
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
  name: '',
  value: '',
})
const Resurrection = new db.Collection('resurrections', {
  uid: '',
})

client.on('message', (message) => {
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
    const tag = encodeURI('"audience applause"')
    let level, user

    if (matches) {
      level = parseInt(matches[2])
      user = message.guild.members.cache.get(matches[1])

      fetch(
        `https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_TOKEN}&tag=${tag}&rating=pg13`
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
            `and have been granted access to \`Limited\` channels. `
          break
        case 10:
          description +=
            `You can now post in <#352149516885164044>, ` +
            `host in <#833933467142062110>, ` +
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

      embed
        .setDescription(description)
        .setTitle('Promotion')
        .setThumbnail(message.mentions.users.first().avatarURL())

      setTimeout(() => {
        embed.setColor(user.displayHexColor)
        promotionChannel.send(embed)
      }, 20 * 1000)
    }
  } else if (message.author.bot) return

  // haikus
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

  // permadeath
  if (message.content.startsWith('!immortal')) {
    const embed = new Discord.MessageEmbed().setColor(embedColorBlack)
    const immortals = Immortal.find().run()

    if (immortals.length > 0) {
      const immortalsSorted = immortals.sort((a, b) => a.score - b.score)
      const immortal = immortalsSorted.pop()

      if (immortal && immortal.uid && immortal.score) {
        embed
          .setDescription(
            `<@${immortal.uid}> with \`${immortal.score}\` points.\n\n` +
              `Bow before our ruler; an immortal being. ` +
              `Behold their glory and unfathomable beauty. ` +
              `Bathe in their light and accept their judgement 💀 `
          )
          .setTitle('Immortal')

        const member = csc.members.cache.get(immortal.uid)
        if (member) embed.setThumbnail(member.user.avatarURL())

        return message.channel.send(embed)
      }
    } else {
      return message.channel.send(
        `There is currently no immortal being present on the server ${randomEmoji()}`
      )
    }
  } else if (
    message.content.startsWith('!points') ||
    message.content.startsWith('!score')
  ) {
    const matches = Immortal.find()
      .matches('uid', message.author.id)
      .limit(1)
      .run()

    if (matches.length > 0)
      return message.channel.send(`You have \`${matches[0].score}\` points.`)
    else
      return message.channel.send(
        `You have not taken any succesful action in a permadeath channel.`
      )
  } else if (message.content.startsWith('!resurrect')) {
    if (!message.member.roles.cache.has(roleGhost))
      return message.channel.send(`You're not dead.`)

    const embed = new Discord.MessageEmbed()
      .setColor(embedColorBlack)
      .setTitle(`Ressurection`)
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
  }

  const permaDeath = () => {
    const channelGraveyard = client.channels.cache.get('832394205422026813')
    const obituary = new Discord.MessageEmbed()
      .setColor(embedColorBlack)
      .setThumbnail(message.author.avatarURL())
      .setTitle(`${message.author.username} :headstone:`)
      .setDescription(
        `Here lies ${message.author}, who died in ${message.channel} just now. ` +
          `May they \`!resurrect\` in peace.`
      )

    if (!isImmortal(message.author.id)) {
      if (message) message.react('💀')
      message.member.roles.add(roleGhost)
      channelGraveyard.send(obituary)
      permaDeathScore(true)
    }
  }

  const permaDeathScore = (death = false) => {
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
      const deaths = Deaths.find().matches('uid', message.author.id).run()

      if (deaths.length > 0) {
        Deaths.update(deaths[0]._id_, {
          deaths: `${parseInt(deaths[0].deaths) + 1}`,
        })
      } else {
        Deaths.add({
          uid: message.author.id,
          deaths: '1',
        })
      }

      Immortal.remove(immortal._id_)
    } else {
      Immortal.update(immortal._id_, {
        score: `${parseInt(immortal.score) + 1}`,
      })
    }
  }

  // #acronyms
  if (message.channel.id === '866967261092773918') {
    const acronym = /^C.+S.+C\S+$/i

    if (message.content.match(acronym)) {
      message.react('✅')
      permaDeathScore()
    } else {
      message.react('❌')
      permaDeath()
    }
  }

  // #all-caps
  else if (message.channel.id === '412714197399371788') {
    const allCaps = /^[A-Z0-9\s-_,./?;:'"‘’“”`~!@#$%^&*()=+|\\<>\[\]{}]+$/gm

    if (!message.content.match(allCaps)) {
      message.react('❌')
      permaDeath()
    } else permaDeathScore()
  }

  // #anonymous
  else if (message.channel.id === '848997740767346699') {
    message.delete()

    const apis = {
      kitten: {
        url: 'https://robohash.org/',
        append: '.png?set=set4',
      },
      monster: {
        url: 'https://robohash.org/',
        append: '.png?set=set2',
      },
      robot: {
        url: 'https://robohash.org/',
      },
      robot2: {
        url: 'https://robohash.org/',
        append: '.png?set=set3',
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

    const emojiVR = `<:anonymous:837247849145303080>`
    const embedColorVR = embedColorBlack
    const textOnly = /^[a-zA-Z0-9\s-_,./?;:'"‘’“”`~!@#$%^&*()=+|\\<>\[\]{}]+$/gm

    let matches = Avatar.find().matches('uid', message.author.id).run()
    let avatar, updateVR

    if (matches.length > 0) {
      avatar = { ...matches[0] }
    } else {
      const key = Avatar.add({
        uid: message.author.id,
      })
      avatar = Avatar.get(key)
    }

    if (message.content.startsWith('!') && message.content.match(textOnly)) {
      if (message.content.startsWith('!avatar')) {
        const embed = new Discord.MessageEmbed()
          .setColor(embedColorVR)
          .setImage(customAvatar(avatar, message))
          .setTitle(customName(avatar))
        message.member.send(embed)
      } else if (message.content.startsWith('!name')) {
        let name = message.content.replace('!name', '').trim()
        Avatar.update(avatar._id_, {
          name: name,
        })
        updateVR = `Name updated ${emojiVR}`
      } else if (message.content.startsWith('!seed')) {
        const random = Math.random().toString().slice(2, 11)
        Avatar.update(avatar._id_, {
          seed: random,
        })
        updateVR = `Seed randomized ${emojiVR}`
      } else if (message.content.startsWith('!style')) {
        const styles = `\`${Object.keys(apis).join('`, `')}\``
        let style = message.content.replace('!style', '').trim()

        if (message.member.roles.cache.has('827915811724460062')) {
          if (style in apis) {
            Avatar.update(avatar._id_, {
              style: style,
            })
            updateVR = `Style updated ${emojiVR}`
          } else {
            message.member.send(`Styles ${emojiVR} ${styles}`)
          }
        } else {
          updateVR = `You must \`!vote\` to access this command ${emojiVR}`
        }
      } else if (message.content.startsWith('!reset')) {
        Avatar.remove(avatar._id_)
        updateVR = `User reset ${emojiVR}`
      }
      if (updateVR)
        message.channel.send(updateVR).then((message) => {
          setTimeout(() => {
            if (message) message.delete()
          }, 5 * 1000)
        })
    } else {
      if (!message.content.match(textOnly) || message.content.length > 2048) {
        permaDeath()
      } else {
        const embed = new Discord.MessageEmbed()
          .setColor(embedColorVR)
          .setDescription(`**${customName(avatar)}**\n${message.content}`)
          .setThumbnail(customAvatar(avatar, message))

        message.channel.send(embed)
        permaDeathScore()
      }
    }
  }

  // #band-names
  else if (message.channel.id === '867179976444870696') {
    message.react('462126280704262144')
    message.react('462126761098870784')
  }

  // #comrades
  else if (message.channel.id === '865757944552488960') {
    const matches = Bio.find().matches('uid', message.author.id).limit(1).run()
    if (matches.length > 0) {
      if (message) message.delete()
      message.channel
        .send(`Please edit your existing bio: ${matches[0].url}`)
        .then((message) => {
          setTimeout(() => {
            if (message) message.delete()
          }, 5 * 1000)
        })
    } else {
      Bio.add({
        uid: message.author.id,
        url: message.url,
      })
    }
  }

  // #counting
  else if (message.channel.id === '827487959241457694') {
    const matches = Meta.find().matches('name', 'counting').limit(1).run()
    const numOnly = /^\d+$/

    let desiredCount, highscore, meta, messageCount

    if (matches.length > 0) {
      meta = { ...matches[0] }
    } else {
      metaKey = Meta.add({
        name: 'counting',
        value: '0|10',
      })

      meta = Meta.get(metaKey)
    }

    desiredCount = parseInt(meta.value.split('|')[0]) + 1
    highscore = parseInt(meta.value.split('|')[1])
    messageCount = parseInt(message.content)

    if (message.content.match(numOnly) && messageCount === desiredCount) {
      if (messageCount > highscore) {
        message.react('☑️')
        Meta.update(meta._id_, {
          value: `${messageCount}|${messageCount}`,
        })
      } else {
        message.react('✅')
        Meta.update(meta._id_, {
          value: `${messageCount}|${highscore}`,
        })
      }
      permaDeathScore()
    } else {
      message.react('❌')
      Meta.update(meta._id_, { value: `0|${highscore}` })
      permaDeath()
    }
  }

  // #word-war
  else if (message.channel.id === '866967592622489640') {
    const matches = Meta.find().matches('name', 'word-war').limit(1).run()

    let firstLetter

    if (matches.length === 0) {
      Meta.add({ name: 'word-war', value: 'a' })
      firstLetter = 'a'
    } else firstLetter = matches[0].value

    if (
      dictionary.check(message.content.toLowerCase()) &&
      message.content.toLowerCase().startsWith(firstLetter)
    ) {
      const newLetter = message.content.toLowerCase().slice(-1)

      Meta.update(matches[0]._id_, { value: newLetter })
      message.react('✅')
      permaDeathScore()
    } else {
      message.react('❌')
      permaDeath()
    }
  }

  // random
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
  } else if (
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

  // commands
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
  } else if (message.content.startsWith('!version')) {
    message.channel.send(version)
  }
})

client.on('ready', () => {
  console.log(`Holly ${version} is online.`)

  csc = client.guilds.cache.get('160320676580818951')

  client.user.setPresence({
    status: 'online',
    activity: {
      name: status[Math.floor(Math.random() * status.length)],
      type: 'PLAYING',
    },
  })
})

client.login()
