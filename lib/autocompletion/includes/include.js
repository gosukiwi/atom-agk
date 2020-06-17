'use babel'

// An include is a file which is included by one or more `.agc` files.
export default class Include {
  constructor (file, sourcefile) {
    this.file = file
    this.includedIn = [sourcefile]
  }

  isInSource (sourcefile) {
    return this.includedIn.includes(sourcefile)
  }

  addSource (sourcefile) {
    this.includedIn.push(sourcefile)
  }

  removeSource (sourcefile) {
    this.includedIn = this.includedIn.filter((s) => s !== sourcefile)
  }
}
