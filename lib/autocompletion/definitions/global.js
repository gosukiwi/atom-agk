'use babel'
import Definition from './definition'

export default class Global extends Definition {
  constructor ({ name, type, file, index }) {
    super(name)
    this.file = file
    this.index = index
    this.type = type
  }

  toSnippet () {
    return { text: this.name, type: 'variable', rightLabel: this.type, leftLabel: 'global' }
  }
}
