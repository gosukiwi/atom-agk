'use babel'
import Scanner from './scanner'

const scanner = new Scanner()

function formatDefinition (definition) {
  if (definition.isFunction()) {
    const args = definition.args.map((arg, index) => `\${${index + 1}:${arg}}`).join(', ')
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
    return new Promise((resolve) => {
      scanner.getDefinitions(prefix).then((definitions) => {
        resolve(definitions.map((definition) => formatDefinition(definition)))
      })
    })
  }
}
