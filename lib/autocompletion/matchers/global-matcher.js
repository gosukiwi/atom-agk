'use babel'
import Global from '../definitions/global'
const REGEX = String.raw`global\s+(?<gname>[a-zA-Z0-9_$#]+)(?:(?:\s*\=)|(?:\s+as\s+(?<gtype>[a-zA-Z0-9_$#]+)))?`

export default class GlobalMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match, file) {
    const name = match.groups.gname

    if (match.groups.gtype) {
      return new Global({ name: name, type: match.groups.gtype, file: file, index: match.index })
    }

    const type = name.endsWith('#') ? 'float' : (name.endsWith('$') ? 'string' : 'integer')
    return new Global({ name, type, file, index: match.index })
  }
}
