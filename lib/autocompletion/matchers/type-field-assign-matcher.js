'use babel'
const REGEX = String.raw`[a-zA-Z0-9_$#]+(?:\.[a-zA-Z0-9_$#]+)+\s*\=`

// This matcher consumes all calls of the type `mytype.field` so they don't
// count as variables.
export default class TypeFieldAssignMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match, file) {
    return null
  }
}
