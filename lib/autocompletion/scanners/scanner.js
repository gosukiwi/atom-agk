'use babel'
import FunctionScanner from './function-scanner'
import TypeScanner from './type-scanner'
import ConstantScanner from './constant-scanner'
import GlobalScanner from './global-scanner'

export default class Scanner {
  constructor (scanners) {
    this.scanners = scanners || {
      function: new FunctionScanner(),
      type: new TypeScanner(),
      constant: new ConstantScanner(),
      global: new GlobalScanner()
    }

    this.regex = new RegExp(Object.keys(this.scanners).map((name) => {
      const regex = this.scanners[name].regex
      return `(?<${name}>${regex})`
    }).join('|'), 'gi')
  }

  scan (text) {
    return [...text.matchAll(this.regex)].map((match) => {
      const name = Object.keys(this.scanners).filter((name) => match.groups[name] !== undefined)[0]
      if (name === undefined) {
        throw new Error(`Could not find scanner for match: ${match}`)
      }

      return this.scanners[name].handleMatch(match)
    })
  }
}