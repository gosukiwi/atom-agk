'use babel'
import Definition from './definition'

export default class Type extends Definition {
  constructor ({ name, file, index }) {
    super(name)
    this.file = file
    this.index = index
  }

  toSnippet () {
    return { text: this.name, type: 'type' }
  }
}
