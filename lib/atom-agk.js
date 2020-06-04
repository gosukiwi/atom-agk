'use babel'
import { CompositeDisposable } from 'atom'
import path from 'path'
import Debugger from './debugger/debugger'
import Compiler from './compiler/compiler'

export default {
  subscriptions: null,

  config: {
    agk_compiler_path: {
      title: 'AGK Compiler Path',
      description: 'The full path to the AGK compiler executable.',
      type: 'string',
      default: 'D:\\Games\\Steam\\steamapps\\common\\App Game Kit 2\\Tier 1\\Compiler\\AGKCompiler.exe'
    }
  },

  activate (state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()
    this.debugger = new Debugger({ subscriptions: this.subscriptions })
    this.compiler = new Compiler(this.subscriptions)
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  consumeIndie (registerIndie) {
    const linter = registerIndie({
      name: 'AGK'
    })
    this.subscriptions.add(linter)

    // error is in the format:
    // main.agc:42: error: Unexpected token "End Of Line"
    this.subscriptions.add(this.compiler.onCompilationFailed((error) => {
      const regex = /([^.]+\.agc):(\d+).+error: (.+)$/
      const [, file, line, message] = error.trim().match(regex)

      const currentEditor = atom.workspace.getActiveTextEditor()
      const currentFilePath = currentEditor.getPath()
      const currentFileDir = path.dirname(currentFilePath)
      const filePath = path.join(currentFileDir, file)

      const end = currentEditor.lineTextForBufferRow(line - 1).length

      linter.setMessages(filePath, [{
        severity: 'error',
        location: {
          file: filePath,
          position: [[line - 1, 0], [line - 1, end]]
        },
        excerpt: message
      }])
    }))

    this.subscriptions.add(this.compiler.onCompilationSucceeded(() => linter.clearMessages()))
  }
}
