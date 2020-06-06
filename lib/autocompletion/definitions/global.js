'use babel'

export default class Global {
  constructor ({ name, type }) {
    this.name = name
    this.type = type
  }

  toSnippet () {
    return { text: this.name, type: 'variable', rightLabel: this.type, leftLabel: 'global' }
  }
}
