const Hypher = require('hypher')
const hypherEnglish = require('hyphenation.en-us')
const hypherInstance = new Hypher(hypherEnglish)
const syllable = require('syllable')

const capitalize = (string) => {
  if (typeof string !== 'string') return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}
const formattedWordArray = (array) => {
  return { word: array.join().replace(',', ''), sylbs: syllable(array) }
}

module.exports = {
  writeHaiku: (message) => {
    let fiveSyl1Count = 0
    let sevenSylCount = 0
    let fiveSyl2Count = 0
    let fiveSyl1 = []
    let sevenSyl = []
    let fiveSyl2 = []
    let wordArray = message.split(' ')

    wordArray.map(word => {
      let not51 = true
      let not7 = true
      let not52 = true

      formattedWord = hypherInstance.hyphenate(word)
      z = formattedWordArray(formattedWord)
      if (fiveSyl1Count <= 4 && sevenSylCount === 0 && fiveSyl2Count === 0) {
        fiveSyl1.push(z.word)
        fiveSyl1Count = z.sylbs + fiveSyl1Count
        if (fiveSyl1Count === 5) {
          not51 = false
        }
      }

      if (
        not51 &&
        fiveSyl1Count === 5 &&
        sevenSylCount <= 6 &&
        fiveSyl2Count === 0
      ) {

        if (sevenSylCount === 6 && hypherInstance.hyphenate(z.word) < 1) {
          sevenSyl.push(formattedWord[0])
          if (formattedWord[1]) {
            fiveSyl2.push(formattedWord[1])
            fiveSyl2Count++
          }
          if (formattedWord[2]) {
            fiveSyl2.push(formattedWord[2])
            fiveSyl2Count++
          }
          if (formattedWord[3]) {
            fiveSyl2.push(formattedWord[3])
            fiveSyl2Count++
          }
          if (formattedWord[4]) {
            fiveSyl2.push(formattedWord[4])
            fiveSyl2Count++
          }
        } else {
          sevenSyl.push(z.word)
          sevenSylCount = sevenSylCount + z.sylbs
        }
        if (sevenSylCount === 7) {
          not7 = false
        }
      }

      if (
        not51 &&
        not7 &&
        fiveSyl1Count === 5 &&
        sevenSylCount === 7 &&
        !sevenSylCount <= 6
      ) {
        fiveSyl2.push(z.word)
        fiveSyl2Count = fiveSyl2Count + z.sylbs
        if (fiveSyl2Count === 5) {
          fiveSyl1Count = 0
          sevenSylCount = 0
          fiveSyl2Count = 0
        }
      }
    })

    const formattedHaiku = `> ${capitalize(fiveSyl1.join(' '))}\n> ${capitalize(sevenSyl.join(' '))}\n> ${capitalize(fiveSyl2.join(' '))}`
    const formattedTwice = formattedHaiku.replace(/,/g, '') // todo: squash this bug

    return {
      message: `${formattedTwice}\n`,
      arrays: { fiveSyl1, sevenSyl, fiveSyl2 }
    }
  }
}