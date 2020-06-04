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
    const filepath = this.asFullPath(file)
    atom.workspace.open(filepath).then((editor) => {
      const end = editor.lineTextForBufferRow(line - 1).length
      this.linter.setMessages(filepath, [{
        severity: 'error',
        location: {
          file: filepath,
          position: [[line - 1, 0], [line - 1, end]]
        },
        excerpt: message
      }])
    })
  }

  dispose () {
    this.linter.clearMessages()
  }

  asFullPath (file) {
    return path.join(this.projectPath(), file)
  }

  projectPath () {
    return atom.project.getPaths()[0]
  }
}
