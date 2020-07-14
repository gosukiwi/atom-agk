'use babel'
import Constant from '../definitions/constant'
const REGEX = String.raw`[ \t]*#constant[ \t]+(?<cname>[a-zA-Z0-9_#$]+)[ \t]+(?<cvalue>.+)[ \t]*\n`

export default class ConstantMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match) {
    const value = match.groups.cvalue.replace('=', '').split(/\/\/|\/\*|\srem/)[0].trim()
    return new Constant({ name: match.groups.cname, value: value })
  }
}
