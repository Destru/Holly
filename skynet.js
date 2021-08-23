require('dotenv').config()
const Discord = require('discord.js')
const clones = [process.env.CLONE, process.env.CLONE2, process.env.CLONE3]

clones.forEach((token, i) => {
  const client = new Discord.Client()

  client.on('ready', () => {
    console.log(`Skynet Clone #${i + 1} online.`)
  })

  client.login(token)
})
