'use babel'
const REGEX = String.raw`remstart(?:.*?)remend|\/\*(?:.*?)\*\/`

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
