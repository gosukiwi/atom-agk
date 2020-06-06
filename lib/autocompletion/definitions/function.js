'use babel'
const FUNCTION_REGEX = /\bfunction\s+([a-zA-Z0-9_#$]+)\s*\(([^\\)]*)\)/ig

export default class FunctionDefinition {
  constructor ({ name, args, type }) {
    this.name = name
    this.args = args
  }

  toSnippet () {
    // return { text: definition.name }
    const args = this.args.map((arg, index) => `\${${index + 1}:${arg[0]} as ${arg[1]}}`).join(', ')
    return { snippet: `${this.name}(${args})`, type: 'function' }
  }

  // Returns an array of function definitions which were matched in the given text
  static scan (text) {
    return [...text.matchAll(FUNCTION_REGEX)].map((match) => {
      const [, name, argsMatch] = match
      const args = argsMatch.split(',').filter((arg) => arg).map((arg) => {
        const parts = arg.trim().split(' ')
        const len = parts.length
        if (len > 1) {
          return [parts[0], parts[len - 1]]
        }

        let name = parts[0]
        let type = 'integer'
        if (name.endsWith('#')) {
          name = name.substring(0, name.length - 1)
          type = 'float'
        } else if (name.endsWith('$')) {
          name = name.substring(0, name.length - 1)
          type = 'string'
        }
        return [name, type]
      })

      return new FunctionDefinition({ name, args, type: 'function' })
    })
  }
}
