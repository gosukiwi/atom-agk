'use babel'

export default class Definition {
  constructor (name) {
    this.name = name
  }

  toSnippet () {
    throw new Error('Implement me')
  }

  matches (prefix, file) {
    return this.name.toLowerCase().startsWith(prefix.toLowerCase())
  }
}
