require('dotenv').config()
const Discord = require('discord.js')
const clones = [process.env.CLONE, process.env.CLONE2, process.env.CLONE3]

clones.forEach((token, i) => {
  const client = new Discord.Client()

  client.on('ready', () => {
    console.log(`Skynet #${i + 1} is online.`)

    client.user.setPresence({
      status: 'online',
      activity: {
        name: `Binärpilot`,
        type: 'LISTENING',
      },
    })
  })

  client.on('typingStart', (channel) => {
    if (channel.id === '848997740767346699') {
      channel.startTyping()
      setTimeout(() => {
        channel.stopTyping()
      }, 10 * 60 * 1000)
    }
  })

  client.login(token)
})
