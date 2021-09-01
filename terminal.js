// JOSHUA ❤️
const prettyMs = require('pretty-ms')

const MESSAGES = {
  error: `There is no such command.`,
}
const VERSION = '0.0.1'

const ascii = [
  `       .+------+     +------+     +------+     +------+     +------+.
     .' |      |    /|      |     |      |     |      |\\    |      | \`.
    +   |      |   + |      |     +      +     |      | +   |      |   +
    |   |      |   | |      |     |      |     |      | |   |      |   |
    |  .+------+   | +------+     +------+     +------+ |   +------+.  |
    |.'      .'    |/      /      |      |      \\      \\|    \`.      \`.|
    +------+'      +------+       +------+       +------+      \`+------+ `,
]
const brain = {
  help: [
    'Only the brave will survive.',
    'You look lost.',
    'There are things we need to discuss.',
    'There is no help here.',
    'Help yourself.',
  ],
  how: 'https://c.tenor.com/bxHQ4KcM8eMAAAAC/magic-meme.gif',
  version: VERSION,
}
const codeblock = {
  end: `\n\`\`\`\n`,
  start: `\`\`\`fix\n`,
}

const login = (user) => {
  const login = ascii[Math.floor(Math.random() * ascii.length)].split('\n')
  let output = login[0]

  user.send(`${codeblock.start}${output}${codeblock.end}`).then((message) => {
    let i = 1
    const animate = setInterval(() => {
      output += `\n${login[i]}`
      message.edit(`${codeblock.start}\n\n${output}\n\n${codeblock.end}`)
      if (i === login.length - 1) clearInterval(animate)
      i++
    }, 1000)
  })
}

module.exports = {
  authenticate: (user) => {
    login(user)
  },
  terminal: (message) => {
    const args = message.content.split(' ')
    const command = args[0].toLowerCase().trim()
    const user = message.author

    let output = ''
    let prompt = `> ${command.toUpperCase()}\n`

    if (command === 'login') return login(user)
    else if (command === 'uptime') output = prettyMs(message.client.uptime)
    else if (Object.keys(brain).includes(command)) {
      if (Array.isArray(brain[command]))
        output =
          brain[command][Math.floor(Math.random() * brain[command].length)]
      else output = brain[command]
    } else output = MESSAGES.error
    if (output.startsWith('http')) return user.send(output)
    else
      return user.send(`${codeblock.start}${prompt}${output}${codeblock.end}`)
  },
}
