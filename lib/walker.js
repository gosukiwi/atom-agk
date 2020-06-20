'use babel'

export default class Walker {
  // Recursively walks through a directory and calls the given callback for each
  // file found.
  walk (directory, cb) {
    directory.getEntries((err, entries) => {
      if (err) throw err

      entries.forEach((entry) => {
        if (entry.isFile()) {
          cb(entry)
        } else if (entry.isDirectory()) {
          this.walk(entry, cb)
        }
      })
    })
  }
}
