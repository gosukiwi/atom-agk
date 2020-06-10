'use babel'
import glob from 'glob'
import fs from 'fs'
import Matcher from './matchers/matcher'

export default class Scanner {
  constructor (matcher) {
    this.matcher = matcher || new Matcher()
  }

  scanPath (path) {
    return new Promise((resolve) => {
      glob(path, (err, files) => {
        if (err) throw err
        Promise
          .all(files.map((file) => this.scanFile(file)))
          .then((results) => resolve(results))
      })
    })
  }

  scanFile (file) {
    return new Promise((resolve) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) throw err
        resolve({ file, definitions: this.scanText(data) })
      })
    })
  }

  scanText (text) {
    return this.matcher.match(text)
  }
}
