require('dotenv').config()
const Discord = require('discord.js')
const clones = [process.env.CLONE, process.env.CLONE2, process.env.CLONE3]
const version = '0.0.2'

clones.forEach((token, i) => {
  const client = new Discord.Client()

  client.on('message', (message) => {
    if (message.author.id !== '160320553322807296') return

    if (message.content === '!version') message.channel.send(version)
  })

  client.on('ready', () => {
    console.log(`Skynet Clone #${i + 1} is online.`)
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
