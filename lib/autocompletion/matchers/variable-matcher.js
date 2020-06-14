'use babel'
import Variable from '../definitions/variable'
const REGEX = String.raw`(?<vname>[a-zA-Z0-9_$#]+)(?:(?:\s*\=)|(?:\s+as\s+(?<vtype>[a-zA-Z0-9_$#]+)))`
const VARIABLES_TABLE = {}

export default class VariableMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match, file) {
    const name = match.groups.vname
    const type = match.groups.vtype || (name.endsWith('#') ? 'float' : (name.endsWith('$') ? 'string' : 'integer'))
    return VariableMatcher.buildOnce({ name, type, file })
  }

  static buildOnce ({ name, type, file }) {
    if (this.isNameTaken(name, file)) return null

    const variable = new Variable({ name, type, file })
    this.addToTable(variable, file)
    return variable
  }

  static clear (file) {
    VARIABLES_TABLE[file] = []
  }

  // private

  static getVariables (file) {
    if (VARIABLES_TABLE[file] === undefined) this.clear(file)
    return VARIABLES_TABLE[file]
  }

  static addToTable (variable, file) {
    this.getVariables(file).push(variable)
  }

  static isNameTaken (name, file) {
    return this.getVariables(file).some((variable) => variable.name === name)
  }
}
