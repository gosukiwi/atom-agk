'use babel'
import { Emitter } from 'atom'
import Process from './process'
import Environment from './environment'

export default class Compiler {
  constructor ({ subscriptions, process, env }) {
    this.emitter = new Emitter()
    this.process = process || new Process()
    this.env = env || new Environment()

    this.process.onStdout((data) => {
      this.emitter.emit('compiler-failed', `${data}`)
    })

    this.process.onClose((res) => {
      if (res === 0) {
        this.emitter.emit('compiler-succeeded')
      }
    })

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
