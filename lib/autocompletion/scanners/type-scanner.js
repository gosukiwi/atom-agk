'use babel'
import Type from '../definitions/type'
const FUNCTION_REGEX = /\btype\s+([a-zA-Z0-9_#$]+)\s+/ig

export default class TypeScanner {
  // Returns an array of function definitions which were matched in the given text
  scan (text) {
    return [...text.matchAll(FUNCTION_REGEX)].map((match) => {
      const [, name] = match
      return new Type({ name })
    })
  }
}
