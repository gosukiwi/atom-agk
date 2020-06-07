'use babel'

export default class BuiltInFunction {
  constructor ({ name, args, category }) {
    this.name = name
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
