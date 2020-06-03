'use babel'
import { CompositeDisposable, Emitter } from 'atom'
import { spawn } from 'child_process'
import path from 'path'
import Debugger from './debugger/debugger'

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
    this.emitter = new Emitter()
    this.debugger = new Debugger(this.subscriptions)

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:compile-and-run': () => this.compileAndRun(),
      'atom-agk:compile': () => this.compile()
    }))
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  compile (flag = '-agk') {
    const currentEditor = atom.workspace.getActiveTextEditor()
    const currentFilePath = currentEditor.getPath()

    // save file before compiling
    const disposable = currentEditor.onDidSave(() => {
      const cmd = spawn(this.getCompilerPath(), [flag, currentFilePath], { cwd: this.getProjectPath() })
      let stdout = ''

      cmd.stdout.on('data', (data) => {
        stdout = `${data}`
      })

      cmd.on('close', (res) => {
        if (res === 0) {
          this.emitter.emit('compiler-succeeded')
        } else {
          this.emitter.emit('compiler-failed', stdout)
        }
      })

      disposable.dispose()
    })

    currentEditor.save()
  },

  compileAndRun () {
    this.compile('-run')
  },

  consumeIndie (registerIndie) {
    const linter = registerIndie({
      name: 'AGK'
    })
    this.subscriptions.add(linter)

    // error is in the format:
    // main.agc:42: error: Unexpected token "End Of Line"
    this.subscriptions.add(this.emitter.on('compiler-failed', (error) => {
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

    this.subscriptions.add(this.emitter.on('compiler-succeeded', () => {
      linter.clearMessages()
    }))
  },

  // private

  getProjectPath () {
    return atom.project.getPaths()[0]
  },

  getCompilerPath () {
    return atom.config.get('atom-agk.agk_compiler_path')
  }
}
