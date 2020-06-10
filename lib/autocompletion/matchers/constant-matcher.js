'use babel'
import Constant from '../definitions/constant'
const REGEX = String.raw`\s*#constant\s+(?<cname>[a-zA-Z0-9_#$]+)\s+(?<cvalue>.+)\s*\n`

export default class ConstantMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match) {
    return new Constant({ name: match.groups.cname, value: match.groups.cvalue })
  }
}
