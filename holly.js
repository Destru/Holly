require('dotenv').config()

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActivityType,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js')

const fs = require('fs')
const db = require('flat-db')
const cron = require('node-cron')
const findahaikuLib = require('findahaiku')
const findahaiku = findahaikuLib.default || findahaikuLib
const path = require('path')
const prettyMsLib = require('pretty-ms')
const prettyMs = prettyMsLib.default || prettyMsLib
const checkWord = require('check-word')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
})

const dictionary = checkWord('en')

const { COLORS, CHANNELIDS, EMOJIIDS, IDS, ROLEIDS } = require('./config')
const BADGES = [
  {
    name: 'Anonymous',
    description: 'We are legion.',
    emoji: '🕵️‍♀️',
  },
  {
    name: 'Creative',
    description: 'Makes cool things.',
    emoji: '👩‍🔬',
  },
  {
    name: 'Hacker',
    description: "Member of the Hacker's Club",
    emoji: '👩‍💻',
  },
  {
    name: 'Immortal',
    description: 'Memento mori.',
    emoji: '🧛‍♀️',
  },
  {
    name: 'Memer',
    description: 'Posts a lot of garbage.',
    emoji: '👩‍🍳',
  },
  {
    name: 'Operator',
    description: 'Member of the admin team.',
    emoji: '👷‍♀️',
  },
  {
    name: 'Patron',
    description: 'Patreon supporter.',
    emoji: '🦸‍♀️',
  },
  {
    name: 'Poet',
    description: 'Writes accidental haikus.',
    emoji: '👩‍🎤',
  },
  {
    name: 'PSYOP',
    description: 'Twitch subscriber.',
    emoji: '👩‍🚀',
  },
]
const METASTATS = ['acronyms', 'bandnames', 'oc', 'memes', 'stimulus']
const PREFIX = '!'
const STATUS = [
  'Back to Reality',
  'Better Than Life',
  'Gunmen of the Apocalypse',
  'Play-by-mail Chess',
]

const KEY = (() => {
  try {
    return (process.env.KEY || fs.readFileSync('./key.md', 'utf8')).trim()
  } catch {
    return ''
  }
})()

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
  '🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿'.split(' ')
const capitalize = (string) => {
  if (typeof string !== 'string') return string
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const isImmortal = (id) => {
  const rows = Permadeath.find().run()
  if (!rows || rows.length === 0) return false
  const top = rows.sort((a, b) => int(b.points) - int(a.points))[0]
  return !!top && top.uid === id
}

const hasContent = (message) => {
  return (
    message.content.includes('http://') ||
    message.content.includes('https://') ||
    message.attachments.size > 0
  )
}

const quotes = [
  `Rude alert! Rude alert! An electrical fire has knocked out my voice recognition unicycle! Many Wurlitzers are missing from my database.`,
  `We have enough food to last thirty thousand years, but we've only got one Milk Dud left. And everyone's too polite to take it.`,
  `Our deepest fear is going space crazy through loneliness. The only thing that helps me keep my slender grip on reality is the friendship I have with my collection of anime waifus.`,
  `Well, the thing about a black hole, its main distinguishing feature, is it's black. And the thing about space, the colour of space, your basic space colour, is black. So how are you supposed to see them?`,
  `Going round in circles for 14 months. Getting my information from the Junior Color Encyclopedia of Space. The respect you have for me is awesome, innit?`,
]

const leaderboardCount = 5
const paginationItems = 5

const ROLE_TO_RANK = [
  [ROLEIDS.cyberpunk, 'Cyberpunk'],
  [ROLEIDS.replicant, 'Replicant'],
  [ROLEIDS.android, 'Android'],
  [ROLEIDS.cyborg, 'Cyborg'],
  [ROLEIDS.augmented, 'Augmented'],
  [ROLEIDS.revolutionary, 'Revolutionary'],
  [ROLEIDS.insurgent, 'Insurgent'],
  [ROLEIDS.activist, 'Activist'],
  [ROLEIDS.comrade, 'Comrade'],
]

const resolveRank = (member) =>
  ROLE_TO_RANK.find(([rid]) => member.roles.cache.has(rid))?.[1] || 'Recruit'

const BADGE_BY_NAME = Object.fromEntries(BADGES.map((b) => [b.name, b]))

const giveBadge = (arr, name) => {
  const b = BADGE_BY_NAME[name]
  if (b) arr.push(b.emoji)
}

const makeEmbed = (color = COLORS.embed) => new EmbedBuilder().setColor(color)

const getUserHaikus = (uid) => Haiku.find().matches('uid', uid).run()

const parseIndexArg = (arg) => {
  const n = parseInt(arg, 10)
  return Number.isInteger(n) && n > 0 ? n - 1 : null
}

const formatHaikuItem = (h, index) =>
  `#${index + 1}\n${h.content}\n<#${h.channel}>`

const buildHaikuListEmbeds = (member, haikus, pageSize = paginationItems) => {
  if (haikus.length <= pageSize) {
    return [
      makeEmbed()
        .setAuthor({
          name: member.user.username,
          iconURL: member.user.displayAvatarURL(),
        })
        .setDescription(
          haikus.map((h, i) => formatHaikuItem(h, i)).join('\n\n'),
        ),
    ]
  }
  const pages = []
  for (let start = 0; start < haikus.length; start += pageSize) {
    const slice = haikus.slice(start, start + pageSize)
    pages.push(
      makeEmbed()
        .setAuthor({
          name: member.user.username,
          iconURL: member.user.displayAvatarURL(),
        })
        .setDescription(
          slice.map((h, i) => formatHaikuItem(h, start + i)).join('\n\n'),
        ),
    )
  }
  return pages
}
const paginateEmbeds = async (message, pages, timeout = 120000) => {
  if (!Array.isArray(pages) || pages.length === 0) return
  let index = 0

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('prev')
      .setLabel('◀')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('next')
      .setLabel('▶')
      .setStyle(ButtonStyle.Secondary),
  )

  const msg = await message.channel.send({
    embeds: [pages[index]],
    components: [row],
  })

  const filter = (i) =>
    i.user.id === message.author.id && i.message.id === msg.id
  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter,
    time: timeout,
  })

  collector.on('collect', async (i) => {
    try {
      switch (i.customId) {
        case 'prev':
          index = index > 0 ? index - 1 : pages.length - 1
          break
        case 'next':
          index = index + 1 < pages.length ? index + 1 : 0
          break
      }
      await i.update({ embeds: [pages[index]], components: [row] })
    } catch (e) {
      try {
        await i.deferUpdate()
      } catch {}
    }
  })

  collector.on('end', async () => {
    try {
      await msg.edit({ components: [] })
    } catch {}
  })
}

const detectHaiku = (text) => {
  try {
    const lines = findahaiku(text, { strict: true }) || []
    if (Array.isArray(lines) && lines.length === 3) {
      return { isHaiku: true, formattedHaiku: lines.join('\n') }
    }
  } catch (e) {}
  return { isHaiku: false, formattedHaiku: '' }
}
const int = (x) => {
  const n = parseInt(x, 10)
  return Number.isFinite(n) && !isNaN(n) ? n : 0
}

const metaCount = (name) =>
  Meta.find()
    .matches('name', name)
    .run()
    .reduce((a, b) => a + int(b.value), 0)

const resolveTopN = async (guild, rows, key, n) => {
  const ranked = [...rows].sort((a, b) => int(b[key]) - int(a[key]))
  const topN = ranked.slice(0, n)
  const resolved = await Promise.all(
    topN.map(async (r) => {
      try {
        const member =
          guild.members.cache.get(r.uid) ||
          (await guild.members.fetch({ user: r.uid, force: false }))
        return { r, member, user: null }
      } catch {
        try {
          const user = await guild.client.users.fetch(r.uid, { force: false })
          return { r, member: null, user }
        } catch {
          return { r, member: null, user: null }
        }
      }
    }),
  )
  return { ranked, topN, resolved }
}

// 🤖 commands
const commands = new Map()
const tryRouter = async (name, ctx) => {
  const fn = commands.get(name)
  if (!fn) return false
  await fn(ctx)
  return true
}

const registerCommands = (names, fn) => {
  const list = Array.isArray(names) ? names : [names]
  for (const n of list) commands.set(n, fn)
}

registerCommands('acronym', handleAcronym)
registerCommands('age', handleAge)
registerCommands(['badge', 'badges'], handleBadge)
registerCommands(['bio', 'profile'], handleProfile)
registerCommands('bot-info', handleBotInfo)
registerCommands(['command', 'commands'], handleCommands)
registerCommands('deaths', handleDeaths)
registerCommands('deploy', handleDeploy)
registerCommands(['haiku', 'haikus'], handleHaiku)
registerCommands(['leaderboard', 'permadeath'], handlePermadeath)
registerCommands('letter', handleLetter)
registerCommands('ping', handlePing)
registerCommands('points', handlePoints)
registerCommands(['resurrect', 'ressurect', 'ressurrect'], handleResurrect)
registerCommands('rotate', handleRotate)
registerCommands('stats', handleStats)
registerCommands('uptime', handleUptime)
registerCommands('version', handleVersion)

async function handleAcronym({ message }) {
  const matches = Meta.find().matches('name', 'acronyms').limit(1).run()
  if (matches.length === 0 || !matches[0].value) {
    return message.channel.send('No acronym is currently active.')
  }
  const value = String(matches[0].value).toLowerCase().trim()
  let acronym = ''
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code >= 97 && code <= 122) acronym += `${alphabetEmoji[code - 97]} `
  }
  return message.channel.send(`${acronym}`)
}

async function handleAge({ message }) {
  const id = subjectId(message)
  const member = await message.guild.members.fetch(id)
  const memberFor = Date.now() - member.joinedAt.getTime()
  return message.channel.send(prettyMs(memberFor))
}

async function handleBadge({ message, args }) {
  if (args.length > 0) {
    const query = args.join(' ').toLowerCase().trim()
    const match =
      BADGES.find((b) => b.name.toLowerCase() === query) ||
      BADGES.find((b) => b.emoji === query)
    if (!match)
      return message.channel.send(
        'No such badge exists. Try `!badges` to see all of them.',
      )
    const embed = makeEmbed()
      .setTitle(`${match.emoji} ${match.name}`)
      .setDescription(match.description)
    return message.channel.send({ embeds: [embed] })
  }
  const embed = makeEmbed()
    .setTitle('Badges')
    .setDescription(BADGES.map((b) => `${b.emoji} ${b.name}`).join('\n'))
    .setFooter({ text: 'Tip: Use !badge <name> to see details.' })
  return message.channel.send({ embeds: [embed] })
}

async function handleBotInfo({ message }) {
  const embed = makeEmbed()
    .setDescription(
      `I have an IQ of 6000; the same IQ as 6000 liberals.` +
        `\n[GitHub Repo](https://github.com/destru/holly) :link:`,
    )
    .setTitle('Holly')
    .addFields(
      {
        name: 'Latency',
        value: `${Date.now() - message.createdTimestamp}ms / ${Math.round(message.client.ws.ping)}ms`,
        inline: true,
      },
      { name: 'Uptime', value: prettyMs(message.client.uptime), inline: true },
      { name: 'Version', value: version, inline: true },
    )
  return message.channel.send({ embeds: [embed] })
}

async function handleCommands({ message }) {
  const embed = makeEmbed()
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
      },
    )
  return message.channel.send({ embeds: [embed] })
}

async function handleDeaths({ message }) {
  const rows = Permadeath.find().run()
  const deathCount = rows.reduce((n, r) => n + int(r.deaths), 0)
  const embed = makeEmbed(COLORS.embedBlack)
    .setTitle('Deaths 🪦')
    .setDescription(`There have been \`${deathCount}\` recorded deaths.`)

  if (rows.length > 0) {
    const { topN, resolved } = await resolveTopN(
      message.guild,
      rows,
      'deaths',
      leaderboardCount,
    )

    const leaderboard = resolved.map(({ r, member, user }, i) => {
      const who = member
        ? `<@${r.uid}>`
        : user
          ? `@${user.username}`
          : `\`${r.uid}\``
      return `${i + 1}. ${who} \`${int(r.deaths)}\``
    })

    embed.addFields({
      name: 'Leaderboard',
      value: leaderboard.join('\n'),
      inline: false,
    })

    const firstPresent = resolved.find((x) => x.member || x.user)
    if (firstPresent) {
      const avatar = firstPresent.member
        ? firstPresent.member.user.displayAvatarURL()
        : firstPresent.user.displayAvatarURL()
      embed.setThumbnail(avatar)
    }
  }

  return message.channel.send({ embeds: [embed] })
}

async function handleDeploy({ message }) {
  if (!message.member.roles.cache.has(ROLEIDS.admin)) return
  if (process.env.DEPLOY_ENABLED !== '1') {
    return message.channel.send('Deploy is disabled on this instance.')
  }
  const commandsBody = [
    new SlashCommandBuilder()
      .setName('anon')
      .setDescription('Send #anonymous messages')
      .addStringOption((o) =>
        o.setName('message').setDescription('Text to send').setRequired(true),
      )
      .addBooleanOption((o) =>
        o.setName('random').setDescription('Randomize avatar'),
      ),
  ].map((c) => c.toJSON())
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)
  await rest.put(Routes.applicationGuildCommands(client.user.id, IDS.csc), {
    body: commandsBody,
  })
  randomAcronym()
  randomLetter()
  return message.channel.send('Deployment successful.')
}

async function handleHaiku({ message, args }) {
  const targetId = subjectId(message)
  const targetHaikus = getUserHaikus(targetId)
  const myHaikus = getUserHaikus(message.author.id)
  if (args[0] === 'show') {
    const idx = parseIndexArg(args[1])
    if (idx === null)
      return message.channel.send(
        'Please provide a valid haiku number to show, e.g. `!haiku show 2`.',
      )
    if (idx < 0 || idx >= myHaikus.length)
      return message.channel.send('Haiku not found in your list.')
    const h = myHaikus[idx]
    const embed = makeEmbed()
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setDescription(`#${idx + 1}\n${h.content}\n<#${h.channel}>`)
    return message.channel.send({ embeds: [embed] })
  }
  if (args[0] === 'remove') {
    const idx = parseIndexArg(args[1])
    if (idx === null)
      return message.channel.send(
        'Please provide a valid haiku number to remove, e.g. `!haiku remove 3`.',
      )
    if (idx < 0 || idx >= myHaikus.length)
      return message.channel.send('Haiku not found in your list.')
    Haiku.remove(myHaikus[idx]._id_)
    return message.channel.send(`Haiku #${idx + 1} removed.`)
  }
  if (targetHaikus.length === 0) return message.channel.send('No haikus found.')
  const member = await message.guild.members.fetch(targetId)
  const pages = buildHaikuListEmbeds(member, targetHaikus, paginationItems)
  if (pages.length === 1) return message.channel.send({ embeds: [pages[0]] })
  return paginateEmbeds(message, pages)
}

async function handleLetter({ message }) {
  const matches = Meta.find().matches('name', 'word-war').limit(1).run()
  if (matches.length > 0)
    return message.channel.send(
      alphabetEmoji[alphabet.indexOf(matches[0].value)],
    )
}

async function handlePermadeath({ message }) {
  const embed = makeEmbed(COLORS.embedBlack)
    .setTitle('Permadeath 💀')
    .setDescription(
      'Contributing in marked channels awards points. Points reset on death. Whoever has the most points is immortal.',
    )

  const rows = Permadeath.find().run()
  if (rows.length > 0) {
    const { topN, resolved } = await resolveTopN(
      message.guild,
      rows,
      'points',
      leaderboardCount,
    )

    const leaderboard = resolved.map(({ r, member, user }, i) => {
      const who = member
        ? `<@${r.uid}>`
        : user
          ? `@${user.username}`
          : `\`${r.uid}\``
      return `${i + 1}. ${who} \`${int(r.points)}\``
    })

    embed.addFields({
      name: 'Leaderboard',
      value: leaderboard.join('\n'),
      inline: false,
    })

    const firstPresent = resolved.find((x) => x.member || x.user)
    if (firstPresent) {
      const avatar = firstPresent.member
        ? firstPresent.member.user.displayAvatarURL()
        : firstPresent.user.displayAvatarURL()
      embed.setThumbnail(avatar)
    }
  }

  return message.channel.send({ embeds: [embed] })
}

async function handlePing({ message }) {
  return message.channel.send(
    `${Date.now() - message.createdTimestamp}ms / ${Math.round(message.client.ws.ping)}ms`,
  )
}

async function handlePoints({ message }) {
  const row = Permadeath.find()
    .matches('uid', message.author.id)
    .limit(1)
    .run()[0]
  const score = row ? int(row.points) : 0
  const points = score === 1 ? 'point' : 'points'
  return message.channel.send(`You have \`${score}\` ${points}.`)
}

async function handleProfile({ message }) {
  const embed = makeEmbed()
  const id = subjectId(message)
  const member = await message.guild.members.fetch(id)
  const admin =
    member.roles.cache.has(ROLEIDS.admin) ||
    member.roles.cache.has(ROLEIDS.operator)
  const avatar =
    Meta.find()
      .matches('uid', id)
      .matches('name', 'avatar')
      .limit(1)
      .run()[0] || null
  const pd = Permadeath.find().matches('uid', id).limit(1).run()
  const haikus = Haiku.find().matches('uid', id).run()
  const patron = member.roles.cache.has(ROLEIDS.patron)
  const psyop = member.roles.cache.has(ROLEIDS.psyop)
  const rabbit = member.roles.cache.has(ROLEIDS.leet)
  const memberFor = Date.now() - member.joinedAt.getTime()
  const rank = resolveRank(member)
  const badges = []
  const stats = []
  let creative = false,
    memer = false
  if (pd.length > 0) stats.push(`Deaths \`${int(pd[0].deaths)}\``)
  METASTATS.forEach((stat) => {
    const m = Meta.find()
      .matches('uid', id)
      .matches('name', stat)
      .limit(1)
      .run()
    if (m.length > 0) {
      let name = capitalize(m[0].name)
      if (name.length <= 2) name = name.toUpperCase()
      stats.push(`${name} \`${m[0].value}\``)
      if (m[0].name === 'oc' && m[0].value >= 10) creative = true
      if (m[0].name === 'memes' && m[0].value >= 100) memer = true
    }
  })
  if (avatar) giveBadge(badges, 'Anonymous')
  if (creative) giveBadge(badges, 'Creative')
  if (admin) giveBadge(badges, 'Operator')
  if (
    member.roles.cache.has(ROLEIDS.engineer) ||
    member.roles.cache.has(ROLEIDS.cyberpunk) ||
    member.roles.cache.has(ROLEIDS.hacker) ||
    member.roles.cache.has(ROLEIDS.coder) ||
    member.roles.cache.has(ROLEIDS.leet)
  )
    giveBadge(badges, 'Hacker')
  if (pd.length > 0 && isImmortal(id)) giveBadge(badges, 'Immortal')
  if (memer) giveBadge(badges, 'Memer')
  if (patron) giveBadge(badges, 'Patron')
  if (haikus && haikus.length >= 10) giveBadge(badges, 'Poet')
  if (psyop) giveBadge(badges, 'PSYOP')
  let description = `\`${prettyMs(memberFor)}\``
  if (badges.length > 0) {
    embed.addFields({
      name: 'Badges',
      value: badges.join(' '),
      inline: false,
    })
  }
  if (haikus.length > 0) {
    const h = haikus[Math.floor(Math.random() * haikus.length)]
    embed.addFields({ name: 'Haiku', value: `*${h.content}*`, inline: false })
    stats.push(`Haikus \`${haikus.length}\``)
  }
  if (stats.length > 0)
    embed.addFields({
      name: 'Stats',
      value: stats.sort().join('\n'),
      inline: true,
    })
  embed
    .setColor(member.displayHexColor || COLORS.embed)
    .setDescription(description)
    .setThumbnail(member.user.displayAvatarURL())
    .setTitle(rank)
  return message.channel.send({ embeds: [embed] })
}

async function handleRotate({ message }) {
  if (!message.member.roles.cache.has(ROLEIDS.admin)) return
  try {
    randomAcronym()
    randomLetter()
    return message.channel.send('Rotated acronym and letter.')
  } catch (e) {
    return message.channel.send('Failed to rotate prompts.')
  }
}

async function handleResurrect({ message }) {
  if (!message.member.roles.cache.has(ROLEIDS.ghost))
    return message.channel.send("You're not dead.")
  const embed = makeEmbed(COLORS.embedBlack).setTitle('Resurrection 🙏')

  const row = Permadeath.find()
    .matches('uid', message.author.id)
    .limit(1)
    .run()[0]
  let timeRemaining
  if (row && row.resurrectedAt) {
    const expires =
      new Date(row.resurrectedAt).getTime() + 3 * 24 * 60 * 60 * 1000
    if (Date.now() < expires) timeRemaining = expires - Date.now()
  }

  if (!timeRemaining) {
    message.member.roles.remove(ROLEIDS.ghost)
    pdResurrect(message.author.id)
    embed.setDescription('You have been resurrected.')
  } else {
    embed.setDescription(
      `You have to wait \`${prettyMs(timeRemaining)}\` to resurrect.`,
    )
  }
  return message.channel.send({ embeds: [embed] })
}

async function handleStats({ message }) {
  const countAcronyms = metaCount('acronyms')
  const countBandNames = metaCount('bandnames')
  const countMemes = metaCount('memes')
  const countOC = metaCount('oc')
  const countStimulus = metaCount('stimulus')
  const countHaikus = Haiku.find().run().length
  const pdRows = Permadeath.find().run()
  const countDeaths = pdRows.reduce((n, r) => n + int(r.deaths), 0)
  const highscore = Meta.find().matches('name', 'counting').limit(1).run()
  let countHighscore = 1
  if (highscore.length > 0) countHighscore = highscore[0].value.split('|')[1]
  const statsNumbers =
    `Counting Highscore \`${countHighscore}\`` +
    `\nDeath Toll \`${countDeaths}\`` +
    `\nMemes \`${countMemes}\`` +
    `\nStimulus \`${countStimulus}\``
  const statsOriginal =
    `Acronyms \`${countAcronyms}\`` +
    `\nBand Names \`${countBandNames}\`` +
    `\nCreative Work \`${countOC}\`` +
    `\nHaikus \`${countHaikus}\``
  const embed = makeEmbed()
    .setTitle('Statistics')
    .setDescription(
      "Some more or *less* useful information. It's less, it's definitely less.",
    )
    .addFields(
      { name: 'Numbers', value: statsNumbers, inline: true },
      { name: 'OC', value: statsOriginal, inline: true },
    )
  return message.channel.send({ embeds: [embed] })
}

async function handleUptime({ message }) {
  return message.channel.send(prettyMs(message.client.uptime))
}

async function handleVersion({ message }) {
  return message.channel.send(version)
}

// legacy
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

  for (let i = 0; i < acronym.length; i++) {
    topic += `${alphabetEmoji[acronym.charCodeAt(i) - 97]} `
  }

  channel.setTopic(`${topic} :skull:`)
}

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const safeReact = async (message, emoji, retries = 2) => {
  try {
    if (message?.partial) await message.fetch()
    await sleep(150)
    await message.react(emoji)
  } catch (e) {
    if (retries <= 0) return
    await sleep(350)
    try {
      await message.react(emoji)
    } catch {
      await sleep(700)
      return safeReact(message, emoji, retries - 1)
    }
  }
}

const setReactions = (message, type = false) => {
  setTimeout(() => {
    switch (type) {
      case 'csc':
        safeReact(message, EMOJIIDS.csc)
        break
      case 'upvote':
        if (message.channel.id === CHANNELIDS.memes)
          safeReact(message, EMOJIIDS.kekw)
        else safeReact(message, EMOJIIDS.upvote)
        break
      case 'skull':
        safeReact(message, '💀')
        break
      case 'binaerpilot':
        safeReact(message, EMOJIIDS.binaerpilot)
        break
      case 'immortal':
        safeReact(message, '🧛')
        break
      case 'heart':
      default:
        safeReact(message, EMOJIIDS.heart)
    }
  }, 1000)
}

const sendTemp = async (channel, content, ms = 10000) => {
  try {
    const msg = await channel.send(content)
    setTimeout(() => msg.delete().catch(() => {}), ms)
    return msg
  } catch {
    return null
  }
}

const subjectId = (message) => {
  const matches = message.content.match(/<@!?(\d+)>/)
  let id = message.author.id
  if (matches) id = matches[1]
  return id
}

const trackByName = (id, name) => {
  let match = Meta.find()
    .matches('uid', id)
    .matches('name', name)
    .limit(1)
    .run()
  if (match.length > 0) {
    Meta.update(match[0]._id_, {
      value: `${int(match[0].value) + 1}`,
    })
  } else {
    Meta.add({
      name: name,
      uid: id,
      value: '1',
    })
  }
}

const version =
  process.env.npm_package_version ||
  (function () {
    try {
      return require('./package.json').version
    } catch {
      return 'dev'
    }
  })()

db.configure({ dir: './data' })

const Haiku = new db.Collection('haikus', {
  uid: '',
  channel: '',
  content: '',
})

const Meta = new db.Collection('meta', {
  uid: '',
  name: '',
  value: '',
})

const Permadeath = new db.Collection('permadeath', {
  uid: '',
  points: '',
  deaths: '',
  resurrectedAt: '',
})

const pdGet = (uid) => {
  const hit = Permadeath.find().matches('uid', uid).limit(1).run()[0]
  if (hit) return hit
  const key = Permadeath.add({
    uid,
    points: '0',
    deaths: '0',
    resurrectedAt: '',
  })
  return Permadeath.get(key)
}
const pdSet = (row) => Permadeath.update(row._id_, row)
const pdAddPoint = (uid) => {
  const row = pdGet(uid)
  pdSet({ ...row, points: String(int(row.points) + 1) })
}
const pdSubPoints = (uid, by) => {
  const row = pdGet(uid)
  const next = Math.max(0, int(row.points) - Math.max(0, by))
  pdSet({ ...row, points: String(next) })
}
const pdApplyDeath = (uid) => {
  const row = pdGet(uid)
  pdSet({
    ...row,
    deaths: String(int(row.deaths) + 1),
    points: '0',
  })
}
const pdResurrect = (uid) => {
  const row = pdGet(uid)
  pdSet({ ...row, resurrectedAt: new Date().toISOString() })
}

client.on('messageCreate', async (message) => {
  const args = message.content.slice(1).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  const { isHaiku, formattedHaiku } = detectHaiku(message.content)

  const permadeath = async (action = 'point') => {
    if (action === 'death') {
      const channelGraveyard = client.channels.cache.get(CHANNELIDS.graveyard)
      const obituary = new EmbedBuilder()
        .setColor(COLORS.embedBlack)
        .setThumbnail(message.author.displayAvatarURL())
        .setTitle('Death 💀')
        .setDescription(`${message.author} died in ${message.channel}`)

      if (!isImmortal(message.author.id)) {
        if (message) setReactions(message, 'skull')
        message.member.roles.add(ROLEIDS.ghost)
        channelGraveyard.send({ embeds: [obituary] })
        pdApplyDeath(message.author.id)
        return
      }
      if (message) setReactions(message, 'immortal')
      const by = Math.floor(Math.random() * 10) + 1
      pdSubPoints(message.author.id, by)
      return
    }
    pdAddPoint(message.author.id)
  }

  if (
    !message.author.bot &&
    isHaiku &&
    message.channel.id !== CHANNELIDS.saferspace
  ) {
    const author =
      message.channel.id === CHANNELIDS.allcaps
        ? message.author.displayName.toUpperCase()
        : message.author.displayName
    const embed = new EmbedBuilder()
      .setColor(COLORS.embed)
      .setDescription(`${formattedHaiku}\n— ${author}`)

    Haiku.add({
      uid: message.author.id,
      channel: message.channel.id,
      content: formattedHaiku,
    })

    message.reply({ embeds: [embed] })
  }

  if (message.author.bot) {
    if (message.channel.id === CHANNELIDS.terminal) {
      if (message.author.id === IDS.hal9000) {
        const matches = message.content.match(
          /<@(\d+)> has reached level (\d+)/,
        )
        const promotionChannel = message.client.channels.cache.get(
          CHANNELIDS.chat,
        )

        if (matches) {
          const level = int(matches[2])

          if (ranks[level]) {
            const id = matches[1]
            const embed = new EmbedBuilder()

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
                description += `Enjoy your new color, comrade!`
            }

            message.guild.members.fetch(id).then((member) => {
              setTimeout(
                () => {
                  embed
                    .setAuthor({
                      name: member.user.username,
                      iconURL: member.user.displayAvatarURL(),
                    })
                    .setColor(member.displayHexColor)
                    .setDescription(description)
                    .setThumbnail(member.user.displayAvatarURL())
                  promotionChannel.send({ embeds: [embed] }).then((message) => {
                    setReactions(message, 'csc')
                  })
                },
                5 * 60 * 1000,
              )
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
        await safeReact(message, '✅')
        permadeath('point')
        trackByName(message.author.id, 'acronyms')
      } else {
        await safeReact(message, '❌')
        permadeath('death')
      }
    }
  } else if (message.channel.id === CHANNELIDS.allcaps) {
    const text = message.content || ''
    if (/[a-z]/.test(text)) {
      await safeReact(message, '❌')
      permadeath('death')
    } else {
      permadeath('point')
    }
  } else if (message.channel.id === CHANNELIDS.bandnames) {
    setReactions(message, 'upvote')
    trackByName(message.author.id, 'bandnames')
  } else if (message.channel.id === CHANNELIDS.counting) {
    const matches = Meta.find().matches('name', 'counting').limit(1).run()
    const numOnly = /^\d+$/

    let desiredCount, highscore, meta, messageCount

    if (matches.length > 0) {
      meta = { ...matches[0] }
    } else {
      const metaKey = Meta.add({
        name: 'counting',
        uid: message.author.id,
        value: '0|1',
      })

      meta = Meta.get(metaKey)
    }

    desiredCount = int(meta.value.split('|')[0]) + 1
    highscore = int(meta.value.split('|')[1])
    messageCount = int(message.content)

    if (
      message.author.id !== meta.uid &&
      message.content.match(numOnly) &&
      messageCount === desiredCount
    ) {
      if (messageCount > highscore) {
        safeReact(message, '☑️')
        Meta.update(meta._id_, {
          uid: message.author.id,
          value: `${messageCount}|${messageCount}`,
        })
      } else {
        safeReact(message, '✅')
        Meta.update(meta._id_, {
          uid: message.author.id,
          value: `${messageCount}|${highscore}`,
        })
      }
      permadeath('point')
    } else {
      safeReact(message, '❌')
      Meta.update(meta._id_, {
        uid: message.author.id,
        value: `0|${highscore}`,
      })
      permadeath('death')
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
        await safeReact(message, '✅')
        permadeath('point')
      } else {
        await safeReact(message, '❌')
        permadeath('death')
      }
    }
  } else if (message.channel.id === CHANNELIDS.wip && hasContent(message)) {
    setReactions(message, 'csc')
    trackByName(message.author.id, 'oc')
  }

  if (message.content.startsWith(PREFIX)) {
    if (await tryRouter(command, { message, args })) return
  } else if (KEY && message.content.includes(KEY)) {
    const hasLeet = message.member.roles.cache.has(ROLEIDS.leet)
    const text = hasLeet
      ? '🐇'
      : 'You can now send anonymous messages with `/anon` 🕵️‍♀️'
    await Promise.allSettled([
      message.delete(),
      hasLeet ? Promise.resolve() : message.member.roles.add(ROLEIDS.leet),
      sendTemp(message.channel, text, 10000),
    ])
  } else if (message.content.includes(':420:')) {
    await safeReact(message, EMOJIIDS.weed)
  }
})

client.on('clientReady', () => {
  console.log(`Holly ${version} is online.`)

  zKillLoop()

  client.user.setPresence({
    status: 'online',
    activities: [
      {
        name: STATUS[Math.floor(Math.random() * STATUS.length)],
        type: ActivityType.Playing,
      },
    ],
  })

  cron.schedule('0 */8 * * *', () => {
    randomAcronym()
    randomLetter()
  })
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  if (interaction.commandName !== 'anon') return

  const channel = interaction.channel
  const member = interaction.member

  if (member.roles.cache.has(ROLEIDS.leet)) {
    const messageText = interaction.options.getString('message', true)
    const randomize = interaction.options.getBoolean('random') ?? false
    const uid = member.id
    const avatar = Meta.find()
      .matches('name', 'avatar')
      .matches('uid', uid)
      .limit(1)
      .run()

    const embed = new EmbedBuilder()
      .setColor(COLORS.embedBlack)
      .setDescription(`**Anonymous**\n${messageText}`)

    if (avatar.length > 0)
      embed.setThumbnail(`https://robohash.org/${avatar[0].value}.png`)
    else embed.setThumbnail(`https://robohash.org/${uid}.png`)

    if (randomize === true) {
      const rng = Math.floor(Math.random() * 900000000000000000)
      if (avatar.length > 0) {
        Meta.update(avatar[0]._id_, { value: `${rng}` })
      } else {
        Meta.add({ name: 'avatar', uid: uid, value: `${rng}` })
      }
      embed.setThumbnail(`https://robohash.org/${rng}.png`)
    }

    await channel.send({ embeds: [embed] })
    await interaction.reply({
      content: `<:anonymous:${EMOJIIDS.anonymous}>`,
      ephemeral: true,
    })
  } else {
    await interaction.reply({
      content: 'Down the rabbit hole :rabbit:',
      ephemeral: true,
    })
  }
})

client.on('threadCreate', async (thread) => {
  try {
    const message = await thread.fetchStarterMessage()
    if (!message) return

    if (thread.parentId === CHANNELIDS.comrades) {
      setReactions(message, 'heart')
    } else if (thread.parentId === CHANNELIDS.creative) {
      const uid = thread.ownerId || message.author.id
      setReactions(message, 'csc')
      trackByName(uid, 'oc')
    }
  } catch (e) {
    console.error(`🤷‍♀️ ${e}`)
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
