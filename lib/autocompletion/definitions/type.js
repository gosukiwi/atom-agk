'use babel'
const FUNCTION_REGEX = /\btype\s+([a-zA-Z0-9_#$]+)\s+/ig

export default class TypeDefinition {
  constructor ({ name }) {
    this.name = name
  }

  toSnippet () {
    return { text: this.name, type: 'type' }
  }

  // Returns an array of function definitions which were matched in the given text
  static scan (text) {
    return new Promise((resolve) => {
      resolve([...text.matchAll(FUNCTION_REGEX)].map((match) => {
        const [, name] = match
        return new TypeDefinition({ name })
      }))
    })
  }
}
