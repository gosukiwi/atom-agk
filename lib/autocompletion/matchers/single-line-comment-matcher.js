'use babel'
const REGEX = String.raw`\/\/.*?(?:\n|$)`

// This matcher consumes all multiline comments so nothing inside them gets
// matched.
export default class SingleLineCommentMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match, file) {
    return null
  }
}
