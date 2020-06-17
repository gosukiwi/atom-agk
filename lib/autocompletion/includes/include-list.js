'use babel'
import Include from './include'

// A list of includes with some convenient methods.
export default class IncludeList {
  constructor () {
    this.includes = []
  }

  add (sourcefile, file) {
    const include = this.findByFile(file)
    if (include === undefined) {
      this.includes.push(new Include(file, sourcefile))
      return
    }

    if (!include.isInSource(sourcefile)) {
      include.addSource(sourcefile)
    }
  }

  remove (include) {
    this.includes = this.includes.filter((i) => i !== include)
  }

  findAllBySource (sourcefile) {
    return this.includes.filter((include) => include.includedIn.includes(sourcefile))
  }

  find (sourcefile, file) {
    return this.includes.find((include) => include.file === file && include.includedIn.includes(sourcefile))
  }

  // private

  findByFile (file) {
    return this.includes.find((include) => include.file === file)
  }
}
