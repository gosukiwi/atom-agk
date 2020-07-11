'use babel'

// For more info on this file, see:
// https://github.com/atom/autocomplete-plus/wiki/Provider-API
export default {
  selector: '.source.agk',
  disableForSelector: '.source.agk .comment',
  inclusionPriority: 1,
  excludeLowerPriority: true,
  suggestionPriority: 2,
  filterSuggestions: true,

  activate: (suggestions) => {
    this.suggestions = suggestions
    this.minimumWordLength = atom.config.get('autocomplete-plus.minimumWordLength')
    console.log()
  },

  getSuggestions: ({ editor, bufferPosition, scopeDescriptor, prefix, activatedManually }) => {
    return new Promise((resolve, reject) => {
      if (prefix.length < this.minimumWordLength) {
        resolve([])
        return
      }

      const filepath = editor.getPath()
      resolve(this.suggestions.get(prefix, filepath).map((definition) => definition.toSnippet()))
    })
  }
}
