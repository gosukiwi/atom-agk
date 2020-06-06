'use babel'

export default class Constant {
  constructor ({ name, value }) {
    this.name = name
    this.value = value
  }

  toSnippet () {
    return { text: this.name, type: 'constant', rightLabel: this.value }
  }
}
