'use babel'
import Definition from './definition'

export default class Function extends Definition {
  constructor ({ name, args }) {
    super(name)
    this.args = args
  }

  toSnippet () {
    const args = this.args.map((arg, index) => `\${${index + 1}:${arg[0]} as ${arg[1]}}`).join(', ')
    return { snippet: `${this.name}(${args})`, type: 'function' }
  }
}
