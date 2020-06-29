'use babel'
import Constant from '../definitions/constant'
const REGEX = String.raw`\s*#constant\s+(?<cname>[a-zA-Z0-9_#$]+)\s+(?<cvalue>.+)\s*\n`

export default class ConstantMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match) {
    const value = match.groups.cvalue.replace('=', '').split(/\/\/|\/\*|\srem/)[0].trim()
    return new Constant({ name: match.groups.cname, value: value })
  }
}
