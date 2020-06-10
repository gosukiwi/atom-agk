'use babel'
import FunctionMatcher from './function-matcher'
import TypeMatcher from './type-matcher'
import ConstantMatcher from './constant-matcher'
import GlobalMatcher from './global-matcher'

export default class Matcher {
  constructor (matchers) {
    this.matchers = matchers || {
      function: new FunctionMatcher(),
      type: new TypeMatcher(),
      constant: new ConstantMatcher(),
      global: new GlobalMatcher()
    }

    this.regex = new RegExp(Object.keys(this.matchers).map((name) => {
      const regex = this.matchers[name].regex
      return `(?<${name}>${regex})`
    }).join('|'), 'gi')
  }

  match (text) {
    return [...text.matchAll(this.regex)].map((match) => {
      const name = Object.keys(this.matchers).filter((name) => match.groups[name] !== undefined)[0]
      if (name === undefined) {
        throw new Error(`Could not find matcher for match: ${match}`)
      }

      return this.matchers[name].handleMatch(match)
    })
  }
}
