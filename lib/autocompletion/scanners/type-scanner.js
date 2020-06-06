'use babel'
import Type from '../definitions/type'
const REGEX = String.raw`\btype\s+(?<tname>[a-zA-Z0-9_#$]+)\s+`

export default class TypeScanner {
  get regex () {
    return REGEX
  }

  // Returns an array of function definitions which were matched in the given text
  handleMatch (match) {
    return new Type({ name: match.groups.tname })
  }
}
