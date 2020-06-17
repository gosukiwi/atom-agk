'use babel'

// An include is a file which is included by one or more `.agc` files.
export default class Include {
  constructor (file, sourcefile) {
    this.file = file
    this.sources = [sourcefile]
  }

  isInSource (sourcefile) {
    return this.sources.includes(sourcefile)
  }

  addSource (sourcefile) {
    this.sources.push(sourcefile)
  }

  removeSource (sourcefile) {
    this.sources = this.sources.filter((s) => s !== sourcefile)
  }
}
