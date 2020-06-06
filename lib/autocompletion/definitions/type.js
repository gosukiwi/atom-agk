'use babel'

export default class Type {
  constructor ({ name }) {
    this.name = name
  }

  toSnippet () {
    return { text: this.name, type: 'type' }
  }
}
