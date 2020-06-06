'use babel'
import { shell } from 'electron'
const REGEX = /[a-zA-Z0-9_]/

export default class Definitions {
  constructor (subscriptions, opener) {
    this.opener = opener || shell.openExternal
    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:open-definition': () => this.open()
    }))
  }

  open () {
    const editor = atom.workspace.getActiveTextEditor()
    const position = editor.getCursorBufferPosition()
    const line = editor.lineTextForBufferRow(position.row)
    const word = this.getWordAtColumn(line, position.column)
    // TODO: Find built-int function definition and open proper documentation
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

  // private

  isWord (letter) {
    return REGEX.test(letter)
  }
}
