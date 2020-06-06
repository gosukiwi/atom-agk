'use babel'
import { Emitter } from 'atom'
import Process from './process'
import Environment from './environment'

export default class Compiler {
  constructor ({ subscriptions, process, env, terminal }) {
    this.emitter = new Emitter()
    this.process = process || new Process()
    this.env = env || new Environment()
    this.terminal = terminal

    this.process.onStdout((data) => {
      this.terminal.write(`Compilation failed: ${data}`)
      this.emitter.emit('compiler-failed', `${data}`)
    })

    this.process.onClose((res) => {
      if (res === 0) {
        this.terminal.write('Compilation successful.')
        this.emitter.emit('compiler-succeeded')
      }
    })

    this.terminal.onCompileButtonClicked(() => this.compile())
    this.terminal.onRunButtonClicked(() => this.compileAndRun())

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:compile-and-run': () => this.compileAndRun(),
      'atom-agk:compile': () => this.compile()
    }))
  }

  onCompilationFailed (cb) {
    return this.emitter.on('compiler-failed', cb)
  }

  onCompilationSucceeded (cb) {
    return this.emitter.on('compiler-succeeded', cb)
  }

  compile (flag = '-agk') {
    const currentEditor = atom.workspace.getActiveTextEditor()
    const currentFilePath = currentEditor.getPath()
    const workspaceElement = atom.views.getView(atom.workspace)

    this.terminal.open()
    this.terminal.write('Compiling...')
    return new Promise((resolve, reject) => {
      atom.commands.dispatch(workspaceElement, 'window:save-all').then(() => {
        this.process.start(this.env.compilerPath(), [flag, currentFilePath], { cwd: this.env.projectPath() })
        resolve()
      })
    })
  }

  compileAndRun () {
    return this.compile('-run')
  }
}
