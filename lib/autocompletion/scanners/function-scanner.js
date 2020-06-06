'use babel'
import Function from '../definitions/function'
const REGEX = String.raw`\bfunction\s+(?<fname>[a-zA-Z0-9_#$]+)\s*\((?<fargs>[^\\)]*)\)`

export default class FunctionScanner {
  get regex () {
    return REGEX
  }

  handleMatch (match) {
    return new Function({ name: match.groups.fname, args: this.scanArgs(match.groups.fargs) })
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
