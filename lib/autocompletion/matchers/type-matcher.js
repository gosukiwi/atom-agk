'use babel'
import Type from '../definitions/type'
const REGEX = String.raw`\btype\s+(?<tname>[a-zA-Z0-9_#$]+)\s+`

export default class TypeMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match) {
    return new Type({ name: match.groups.tname })
  }
}
