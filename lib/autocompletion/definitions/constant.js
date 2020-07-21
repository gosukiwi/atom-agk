'use babel'
import Definition from './definition'

export default class Constant extends Definition {
  constructor ({ name, value, file, index }) {
    super(name)
    this.file = file
    this.index = index
    this.value = value
  }

  toSnippet () {
    return { text: this.name, type: 'constant', rightLabel: this.value }
  }
}
