'use babel'
const REGEX = /[a-zA-Z0-9_]/

export default class WordAction {
  getWordUnderCursor () {
    const editor = atom.workspace.getActiveTextEditor()
    const position = editor.getCursorBufferPosition()
    return this.getWordAtColumn(editor.lineTextForBufferRow(position.row), position.column)
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
