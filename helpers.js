module.exports = {
  days: 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
  getRandom : (type, a, n) => {
    let result = new Array(n)
      len = a.length,
      taken = new Array(len)

    if (n > len) throw new RangeError('getRandom: asking for too many')

    while (n--) {
      let x = Math.floor(Math.random() * len)

      if (type === 'events' && a[x].year) {
        if (!isFinite(a[x].year)) a[x].year = `-${a[x].year.replace(/ BC/, '')}`
        result[n] = a[x in taken ? taken[x] : x]
        taken[x] = --len in taken ? taken[len] : len
      } else {
        throw new Error('getRandom: no type specified')
      }
    }

    if(type === 'events') {
      result.sort((a, b) => a.year - b.year)
    }

    return result
  }
}