require('dotenv').config()
require('discord-reply')
const Discord = require('discord.js')
const fs = require('fs')

const client = new Discord.Client()
const cron = require('node-cron')
const fetch = require('node-fetch')
const syllable = require('syllable')
const { days, getRandom, writeHaiku } = require('./helpers')

let csc = 'Cyberpunk Social Club'
const dailyDeathsChannel = '160320676580818951'
const dailyEventsChannel = '160320676580818951'
const destru = '160320553322807296';
const insultUsers = ['400786664861204481']
const randomChance = 0.01
const status = ['Back to Reality', 'Better Than Life', 'Gunmen of the Apocalypse', 'Play-by-mail Chess']
const version = process.env.npm_package_version || '(Development)'

cron.schedule('0 */4 * * *', () => {
  client.user.setPresence({
    status: 'online',
    activity: {
      name: status[Math.floor(Math.random() * status.length)],
      type: 'PLAYING',
    }
  })
})

cron.schedule('0 8 * * *', () => {
  const now = new Date()

  fetch(`https://byabbe.se/on-this-day/${now.getMonth()}/${now.getDate()}/deaths.json`)
    .then(response => response.json())
    .then(data => {
      const deaths = getRandom('byabbe', data.deaths, 15)
      const embed = new Discord.MessageEmbed()
        .setColor('#ffff00')
        .setImage('https://media.giphy.com/media/h5NLPVn3rg0Rq/giphy.gif')
        .setTitle(`Today is ${days[now.getDay()]}, ${data.date}.`)
        .setFooter(csc.name, csc.iconURL())

      deaths.forEach((death, i) => {
        embed.addField(`:headstone: ${death.year}`, `[${death.wikipedia[0].title}](${death.wikipedia[0].wikipedia})`, true);
      })

      client.channels.cache.get(dailyDeathsChannel).send(embed)
    })

  fetch(`https://byabbe.se/on-this-day/${now.getMonth()}/${now.getDate()}/events.json`)
    .then(response => response.json())
    .then(data => {
      const events = getRandom('byabbe', data.events, 5)
      const embed = new Discord.MessageEmbed()
        .setColor('#ffff00')
        .setTitle(`Today is ${days[now.getDay()]}, ${data.date}.`)
        .setFooter(csc.name, csc.iconURL())

      events.forEach(event => {
        let description = event.description

        event.wikipedia.forEach((wiki, i) => {
          let link = `[${wiki.title}](${wiki.wikipedia})`

          if (i === 0) description += `\n:book: ${link}`
          else description += `, ${link}`
        })

        embed.addField(event.year, description)
      })

      client.channels.cache.get(dailyEventsChannel).send(embed)
    })
})

client.on('message', message => {
  if (insultUsers.includes(message.author.id) && Math.random() < randomChance) {
    fetch('https://insult.mattbas.org/api/insult.json')
      .then(response => response.json())
      .then(data => {
        message.channel.send(`${data.insult}, ${message.author}`);
      })
  }

  if (message.author.bot) return

  if (message.content.startsWith('!ping')) {
    message.channel.send(`${Date.now() - message.createdTimestamp}ms / ${Math.round(client.ws.ping)}ms`);
  }
  else if (message.content.startsWith('!run')) {
    if (message.author.id === destru) {
      console.log(`Hi, it's me, you!`)
    }
    else message.channel.send(`You're not <@${destru}>, ${message.author}`)
  }
  else if(syllable(message.content) === 17) {
    const embed = new Discord.MessageEmbed()
      .setColor('#ffff00')
      .setDescription(`${writeHaiku(message.content).message}\n_—${message.author.username}, ${new Date().getFullYear()}_`)
      .setFooter(csc.name, csc.iconURL())
      .setTitle('Haiku')

    message.lineReply(embed)

  }
  else {
    const businessChannels = ['845382463685132288', '829717667107700746']
    const complimentChannels = ['845382463685132288', '836963196916858902']
    const complimentEmoji = [':heart:', ':heart_eyes:', ':black_heart:', ':blue_heart:', ':brown_heart:', ':green_heart:', ':orange_heart:', ':purple_heart:', ':sparkling_heart:', ':white_heart:', ':yellow_heart:', ':smiling_face_with_3_hearts:', ':kiss:', ':kissing:', ':kissing_heart:', ':kissing_closed_eyes:', ':kissing_smiling_eyes:']

    if (complimentChannels.includes(message.channel.id) && Math.random() < randomChance) {
      fetch('https://complimentr.com/api')
        .then(response => response.json())
        .then(data => {
          let compliment = data.compliment.charAt(0).toUpperCase() + data.compliment.slice(1);
          let emoji = complimentEmoji[Math.floor(Math.random() * status.length)];

          message.channel.send(`${compliment}, ${message.author} ${emoji}`);
        })
    }
    else if (businessChannels.includes(message.channel.id) && Math.random() < randomChance) {
      fetch('https://corporatebs-generator.sameerkumar.website/')
        .then(response => response.json())
        .then(data => {
          let bullshit = data.phrase.charAt(0).toUpperCase() + data.phrase.toLowerCase().slice(1);
          message.channel.send(`${bullshit} :man_office_worker:`);
        })
    }
  }
})

client.on('ready', () => {
  console.log(`Holly ${version} is online.`)
  csc = client.guilds.cache.get('160320676580818951')

  client.user.setPresence({
    status: 'online',
    activity: {
      name: `Destru's OnlyFans`,
      type: 'WATCHING',
    }
  })
})

client.login()