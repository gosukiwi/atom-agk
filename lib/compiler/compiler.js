'use babel'
import { Emitter } from 'atom'
import Process from '../process'

export default class Compiler {
  constructor (disposables) {
    this.emitter = new Emitter()
    this.process = new Process()

    this.process.onStdout((data) => {
      this.emitter.emit('compiler-failed', `${data}`)
    })

    this.process.onClose((res) => {
      if (res === 0) {
        this.emitter.emit('compiler-succeeded')
      }
    })

    disposables.add(atom.commands.add('atom-workspace', {
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

    atom.commands.dispatch(workspaceElement, 'window:save-all').then(() => {
      this.process.start(this.getCompilerPath(), [flag, currentFilePath], { cwd: this.getProjectPath() })
    })
  }

  compileAndRun () {
    this.compile('-run')
  }

  // private

  getProjectPath () {
    return atom.project.getPaths()[0]
  }

  getCompilerPath () {
    return atom.config.get('atom-agk.agk_compiler_path')
  }
}
