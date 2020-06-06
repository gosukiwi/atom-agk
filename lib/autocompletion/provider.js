'use babel'
import Scanner from './scanner'

const scanner = new Scanner()

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
      scanner.getDefinitions(prefix).then((results) => {
        resolve(results.map((text) => { return { text } }))
      })
    })
  }
}
