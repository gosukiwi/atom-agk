'use babel'
import Matcher from './matchers/matcher'
import Walker from '../walker'

export default class Scanner {
  constructor (matcher) {
    this.matcher = matcher || new Matcher()
    this.walker = new Walker()
  }

  scanDirectory (directory, cb) {
    this.walker.walk(directory, (file) => {
      if (file.getBaseName().endsWith('.agc')) {
        this.scanFile(file).then((result) => cb(result))
      }
    })
  }

  scanFile (file) {
    return new Promise((resolve) => {
      file.read(false).then((text) => {
        if (text === null) throw new Error(`Could not find file ${file}`)
        resolve(this.scanText(text, file.getPath()))
      })
    })
  }

  scanText (text, file) {
    return { file, definitions: this.matcher.match(text, file), includes: this.matcher.includes }
  }

  includes () {
    return this.matcher.includes()
  }
}
