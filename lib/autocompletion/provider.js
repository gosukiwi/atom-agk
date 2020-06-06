'use babel'
import Definitions from './definitions'

const definitions = new Definitions()
const MINIMUM_LENGTH_QUERY = 3

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
      if (prefix.length < MINIMUM_LENGTH_QUERY) {
        resolve([])
        return
      }

      resolve(definitions.get(prefix).map((definition) => definition.toSnippet()))
    })
  }
}
