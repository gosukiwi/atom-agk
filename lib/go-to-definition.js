'use babel'
import FunctionMatcher from './autocompletion/matchers/function-matcher'
const REGEX = /[a-zA-Z0-9_]/

export default class GoToDefinition {
  constructor ({ subscriptions }) {
    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:go-to-definition': () => this.goToDefinition()
    }))
  }

  goToDefinition () {
    const editor = atom.workspace.getActiveTextEditor()
    const position = editor.getCursorBufferPosition()
    const word = this.getWordAtColumn(editor.lineTextForBufferRow(position.row), position.column)
    const func = FunctionMatcher.find(word)
    if (func) {
      this.open(func.file, func.index)
    }
  }

  // private

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

  getWordAtColumn (line, column) {
    let left = column
    let right = column
    const len = line.length - 1

    while (left > 0) {
      if (this.isWord(line[left])) {
        left = left - 1
      } else {
        left = left + 1
        break
      }
    }

    while (right < len) {
      if (this.isWord(line[right])) {
        right = right + 1
      } else {
        right = right - 1
        break
      }
    }

    return line.substring(left, right + 1)
  }

  isWord (letter) {
    return REGEX.test(letter)
  }
}
