'use babel'
import WordAction from './word-action'
import FunctionMatcher from '../autocompletion/matchers/function-matcher'

export default class GoToDefinition extends WordAction {
  constructor ({ subscriptions }) {
    super()
    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:go-to-definition': () => this.goToDefinition()
    }))
  }

  goToDefinition () {
    const word = this.getWordUnderCursor()
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
