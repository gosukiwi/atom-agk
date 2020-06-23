'use babel'
import Finder from './finder'
import FunctionMatcher from '../autocompletion/matchers/function-matcher'

export default class GoToDefinition {
  constructor ({ subscriptions }) {
    this.finder = new Finder()
    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:go-to-definition': () => this.goToDefinition()
    }))
  }

  goToDefinition () {
    const word = this.finder.getWordUnderCursor()
    const func = FunctionMatcher.find(word)
    if (func) {
      this.open(func.file, func.index)
    }
  }

  open (file, index) {
    return new Promise((resolve) => {
      atom.workspace.open(file).then(() => {
        const editor = atom.workspace.getActiveTextEditor()
        const position = editor.getBuffer().positionForCharacterIndex(index)
        editor.setCursorBufferPosition(position)
        resolve()
      })
    })
  }
}
