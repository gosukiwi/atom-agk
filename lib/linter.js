'use babel'
import Environment from './environment'

const REGEX = /([^.]+\.agc):(\d+).+error: (.+)$/

export default class Linter {
  constructor ({ linter, compiler, environment }) {
    this.linter = linter
    this.environment = environment || Environment.instance

    compiler.onCompilationFailed((error) => { // error is in the format: `main.agc:42: error: Unexpected token "End Of Line"'
      const [, file, line, message] = error.trim().match(REGEX)
      this.lint({ file, line, message })
    })

    compiler.onCompilationSucceeded(() => linter.clearMessages())
  }

  lint ({ file, line, message }) {
    const filepath = this.fullPath(file)
    return atom.workspace.open(filepath).then((editor) => {
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
    this.environment.dispose()
  }

  fullPath (file) {
    return this.environment.fullPath(file)
  }
}
