'use babel'
import Environment from './environment'

const REGEX = /([^.]+\.agc):(\d+).+error: (.+)$/

export default class Linter {
  constructor ({ linter, compiler, environment }) {
    this.linter = linter
    this.environment = environment || Environment.instance

    compiler.onCompilationFailed((errors) => { // error is in the format: `main.agc:42: error: Unexpected token "End Of Line"'
      const messages = {}
      errors.trim().split('\n').forEach((error) => {
        const match = error.trim().match(REGEX)
        if (match === null) return

        const [, file, line, excerpt] = match
        messages[file] = messages[file] || []
        messages[file].push({ line, excerpt })
      })

      Object.keys(messages).forEach((file) => {
        this.lint(file, messages[file])
      })
    })

    compiler.onCompilationSucceeded(() => linter.clearMessages())
  }

  lint (file, messages) {
    const filepath = this.fullPath(file)
    const lintMessages = messages.map((message) => {
      return {
        severity: 'error',
        location: {
          file: filepath,
          position: [[message.line - 1, 0], [message.line - 1, 240]]
        },
        excerpt: message.excerpt
      }
    })

    this.linter.setMessages(filepath, lintMessages)
  }

  dispose () {
    this.linter.clearMessages()
    this.environment.dispose()
  }

  fullPath (file) {
    return this.environment.fullPath(file)
  }
}
