'use babel'
const REGEX = String.raw`remstart(?:\s|\S)*?remend|\/\*(?:\s|\S)*?\*\/`

// This matcher consumes all multiline comments so nothing inside them gets
// matched.
export default class CommentMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match, file) {
    return null
  }
}
