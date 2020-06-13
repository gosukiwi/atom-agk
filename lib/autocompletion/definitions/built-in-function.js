'use babel'
import Definition from './definition'

export default class BuiltInFunction extends Definition {
  constructor ({ name, args, category }) {
    super(name)
    this.args = args
    this.category = category
  }

  toSnippet () {
    const args = this.args
      .substring(1, this.args.length - 2)
      .trim()
      .split(',')
      .map((arg, index) => `\${${index + 1}:${arg}}`)
      .join(', ')
    return { snippet: `${this.name}(${args})`, type: 'function', rightLabel: 'AGK' }
  }
}
