'use babel'
import Definition from './definition'

export default class Function extends Definition {
  constructor ({ name, args, file, index }) {
    super(name)
    this.args = args
    this.file = file
    this.index = index
  }

  toSnippet () {
    const args = this.args.map((arg, index) => `\${${index + 1}:${arg[0]}}`).join(', ')
    return { snippet: `${this.name}(${args})`, type: 'function' }
  }
}
