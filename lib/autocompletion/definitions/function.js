'use babel'

export default class Function {
  constructor ({ name, args }) {
    this.name = name
    this.args = args
  }

  toSnippet () {
    const args = this.args.map((arg, index) => `\${${index + 1}:${arg[0]} as ${arg[1]}}`).join(', ')
    return { snippet: `${this.name}(${args})`, type: 'function' }
  }
}
