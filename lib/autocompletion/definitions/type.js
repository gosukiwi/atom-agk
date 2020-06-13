'use babel'
import Definition from './definition'

export default class Type extends Definition {
  constructor ({ name }) {
    super(name)
  }

  toSnippet () {
    return { text: this.name, type: 'type' }
  }
}
