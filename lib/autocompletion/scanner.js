'use babel'
import Matcher from './matchers/matcher'

export default class Scanner {
  constructor (matcher) {
    this.matcher = matcher || new Matcher()
  }

  scanDirectory (directory, cb) {
    directory.getEntries((err, entries) => {
      if (err) throw err

      entries.forEach((entry) => {
        if (entry.isFile() && entry.getBaseName().endsWith('.agc')) {
          this.scanFile(directory, entry).then((result) => cb(result))
        } else if (entry.isDirectory()) {
          this.scanDirectory(entry, cb)
        }
      })
    })
  }

  scanFile (projectDirectory, file) {
    return new Promise((resolve) => {
      file.read(false).then((text) => {
        if (text === null) throw new Error(`Could not find file ${file}`)
        resolve(this.scanText(projectDirectory, text, file.getPath()))
      })
    })
  }

  scanText (projectDirectory, text, file) {
    return { directory: projectDirectory, file, definitions: this.matcher.match(text, file), includes: this.matcher.includes }
  }

  includes () {
    return this.matcher.includes()
  }
}
