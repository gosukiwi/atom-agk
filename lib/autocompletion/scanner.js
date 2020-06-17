'use babel'
import glob from 'glob'
import fs from 'fs'
import path from 'path'
import Matcher from './matchers/matcher'

export default class Scanner {
  constructor (matcher) {
    this.matcher = matcher || new Matcher()
  }

  // Scans the specified path (using glob syntax) and calls the given callback
  // with the result of each scanned file.
  scanPath (pattern, cb) {
    glob(pattern, (err, files) => {
      if (err) throw err
      files.forEach((file) => {
        this.scanFile(path.normalize(file)).then((result) => cb(result))
      })
    })
  }

  scanFile (file) {
    return new Promise((resolve) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) throw err
        resolve(this.scanText(data, file))
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
