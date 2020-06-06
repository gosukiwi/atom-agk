'use babel'
import Constant from '../definitions/constant'
const REGEX = /\s*#constant\s+([a-zA-Z0-9_#$]+)\s+(.+)\s*\n/ig

export default class ConstantScanner {
  // Returns an array of function definitions which were matched in the given text
  scan (text) {
    return [...text.matchAll(REGEX)].map((match) => {
      const [, name, value] = match
      return new Constant({ name, value })
    })
  }
}
