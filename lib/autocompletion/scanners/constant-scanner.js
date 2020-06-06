'use babel'
import Constant from '../definitions/constant'
const REGEX = String.raw`\s*#constant\s+(?<cname>[a-zA-Z0-9_#$]+)\s+(?<cvalue>.+)\s*\n`

export default class ConstantScanner {
  get regex () {
    return REGEX
  }

  // Returns an array of function definitions which were matched in the given text
  handleMatch (match) {
    return new Constant({ name: match.groups.cname, value: match.groups.cvalue })
  }
}
