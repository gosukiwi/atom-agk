'use babel'
import Scanner from './scanner'

const scanner = new Scanner()

function formatDefinition (definition) {
  if (definition.isFunction()) {
    const args = definition.args.map((arg, index) => `\${${index + 1}:${arg[0]} as ${arg[1]}}`).join(', ')
    return { snippet: `${definition.name}(${args})`, type: 'function' }
  }

  return { text: definition.name }
}

// For more info on this file, see:
// https://github.com/atom/autocomplete-plus/wiki/Provider-API
export default {
  selector: '.source.agk',
  disableForSelector: '.source.agk .comment',
  inclusionPriority: 1,
  excludeLowerPriority: true,
  suggestionPriority: 2,
  filterSuggestions: true,

  getSuggestions: ({ editor, bufferPosition, scopeDescriptor, prefix, activatedManually }) => {
    return new Promise((resolve, reject) => {
      if (prefix.length < 3) {
        resolve([])
        return
      }

      scanner.getDefinitions(prefix).then((definitions) => {
        resolve(definitions.map((definition) => formatDefinition(definition)))
      })
    })
  }
}
