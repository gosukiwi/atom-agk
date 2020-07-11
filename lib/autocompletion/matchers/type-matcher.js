'use babel'
import Type from '../definitions/type'
const REGEX = String.raw`\btype\s+(?<tname>[a-zA-Z0-9_]+[$#]?)(\s|[^\s])+?endtype`

export default class TypeMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match, file) {
    return new Type({ name: match.groups.tname, file, index: match.index })
  }
}
