'use babel'
import Definition from './definition'

export default class Variable extends Definition {
  constructor ({ name, type, file }) {
    super(name)
    this.type = type
    this.file = file
  }

  toSnippet () {
    return { text: this.name, type: 'variable', rightLabel: this.type }
  }

  matches (prefix, file) {
    if (this.file !== file) return false
    return super.matches(prefix, file)
  }
}
