'use babel'
import FunctionMatcher from './function-matcher'
import TypeMatcher from './type-matcher'
import ConstantMatcher from './constant-matcher'
import GlobalMatcher from './global-matcher'
import VariableMatcher from './variable-matcher'
import TypeFieldAssignMatcher from './type-field-assign-matcher'

export default class Matcher {
  constructor (matchers) {
    this.matchers = matchers || {
      function: new FunctionMatcher(),
      type: new TypeMatcher(),
      type_field_assign: new TypeFieldAssignMatcher(),
      constant: new ConstantMatcher(),
      global: new GlobalMatcher(),
      variable: new VariableMatcher()
    }

    this.regex = new RegExp(Object.keys(this.matchers).map((name) => {
      const regex = this.matchers[name].regex
      return `(?<${name}>${regex})`
    }).join('|'), 'gi')
  }

  match (text, file) {
    this.matchers.variable.clear(file)

    return [...text.matchAll(this.regex)].map((match) => {
      const name = Object.keys(this.matchers).filter((name) => match.groups[name] !== undefined)[0]
      if (name === undefined) {
        throw new Error(`Could not find matcher for match: ${match}`)
      }

      return this.matchers[name].handleMatch(match, file)
    }).filter((definition) => definition !== null)
  }
}
