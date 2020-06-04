'use babel'
import path from 'path'

const REGEX = /([^.]+\.agc):(\d+).+error: (.+)$/

export default class Linter {
  constructor (linter, compiler) {
    this.linter = linter

    compiler.onCompilationFailed((error) => { // error is in the format: `main.agc:42: error: Unexpected token "End Of Line"'
      const [, file, line, message] = error.trim().match(REGEX)
      this.lint(file, line, message)
    })

    compiler.onCompilationSucceeded(() => linter.clearMessages())
  }

  lint (file, line, message) {
    // TODO: get editor for file, or make new one if non-existant and focus that
    const currentEditor = atom.workspace.getActiveTextEditor()
    const currentEditorPath = currentEditor.getPath()
    const currentFileDir = path.dirname(currentEditorPath)
    const filePath = path.join(currentFileDir, file)
    const end = currentEditor.lineTextForBufferRow(line - 1).length

    this.linter.setMessages(filePath, [{
      severity: 'error',
      location: {
        file: filePath,
        position: [[line - 1, 0], [line - 1, end]]
      },
      excerpt: message
    }])
  }

  dispose () {
    this.linter.clearMessages()
  }
}
