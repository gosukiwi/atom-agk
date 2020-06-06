'use babel'
import Function from '../definitions/function'
const FUNCTION_REGEX = /\bfunction\s+([a-zA-Z0-9_#$]+)\s*\(([^\\)]*)\)/ig

export default class FunctionScanner {
  // Returns an array of function definitions which were matched in the given text
  scan (text) {
    return [...text.matchAll(FUNCTION_REGEX)].map((match) => {
      const [, name, args] = match
      return new Function({ name, args: this.scanArgs(args) })
    })
  }

  scanArgs (args) {
    return args.split(',').filter((arg) => arg).map((arg) => {
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
  }
}
