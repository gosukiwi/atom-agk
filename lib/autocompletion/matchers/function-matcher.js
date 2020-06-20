'use babel'
import VariableMatcher from './variable-matcher'
import Function from '../definitions/function'
const REGEX = String.raw`\bfunction\s+(?<fname>[a-zA-Z0-9_#$]+)\s*\((?<fargs>[^\\)]*)\)`
const FUNCTION_TABLE = {}

export default class FunctionMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match, file) {
    const args = this.handleArgs(match.groups.fargs)
    const variables = args.map((arg) => {
      return VariableMatcher.buildOnce({ name: arg[0], type: arg[1], file })
    })
    const func = new Function({ name: match.groups.fname, args, file, index: match.index })
    FUNCTION_TABLE[func.name.toLowerCase()] = func
    return variables.concat(func)
  }

  handleArgs (args) {
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

  static find (name) {
    return FUNCTION_TABLE[name.toLowerCase()]
  }
}
