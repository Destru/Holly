const VERSION = '0.0.1'

const ascii = [
  `       ______
    .-"      "-.
   /            \\
  |              |
  |,  .-.  .-.  ,|
  | )(__/  \\__)( |
  |/     /\\     \\|
  (_     ^^     _)
   \__|IIIIII|__/
    | \\IIIIII/ |
    \\          /
     \`--------\``,
]
const brain = {
  version: VERSION,
}
const codeblock = {
  end: `\n\`\`\`\n`,
  start: `\`\`\`fix\n`,
}

module.exports = {
  authenticate: (user) => {
    const login = ascii[Math.floor(Math.random() * ascii.length)]

    output += codeblock.start
    login.split('\n').forEach((line, i) => {
      setTimeout(() => {
        output += `${line}\n`
      }, 1000 * i)
    })
    output += codeblock.end
    user.send(output)
  },
  terminal: (message) => {
    const args = message.content.split(' ')
    const command = args[0].toLowerCase()

    let output = ''
    let prompt =
      `${codeblock.start}` + `>=${command.toUpperCase()}\n` + `${codeblock.end}`

    if (Object.keys(brain).includes(command)) {
      if (Array.isArray(brain[command]))
        output +=
          brain[command][Math.floor(Math.random() * brain[command].length)]
      else output += brain[command]
      return message.author.send(prompt + output)
    }
  },
}
