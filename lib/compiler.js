'use babel'
import { Emitter } from 'atom'
import Process from './process'
import Environment from './environment'

export default class Compiler {
  constructor ({ subscriptions, process, env, terminal }) {
    this.emitter = new Emitter()
    this.process = process || new Process()
    this.env = env || Environment.instance
    this.terminal = terminal

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:compile-and-run': () => this.compileAndRun(),
      'atom-agk:compile': () => this.compile()
    }))

    subscriptions.add(this.env)

    this.process.onStdout((data) => {
      data = `${data}`
      this.terminal.write('Compilation failed:')
      data.trim().split('\n').forEach((line) => {
        this.terminal.write(`< ${line}`, 1)
      })
      this.emitter.emit('compiler-failed', data)
    })

    this.process.onClose((res) => {
      if (res === 0) {
        this.emitter.emit('compiler-succeeded')
        this.terminal.write('Compilation successful.')
      }
    })

    this.terminal.onCompileButtonClicked(() => this.compile())
    this.terminal.onRunButtonClicked(() => this.compileAndRun())
  }

  onCompilationFailed (cb) {
    this.terminal.open()
    return this.emitter.on('compiler-failed', cb)
  }

  onCompilationSucceeded (cb) {
    return this.emitter.on('compiler-succeeded', cb)
  }

  compile (flag = '-agk') {
    const currentEditor = atom.workspace.getActiveTextEditor()
    const currentFilePath = currentEditor.getPath()
    const compilerPath = this.env.compilerPath()

    this.terminal.write('Compiling...')
    return new Promise((resolve, reject) => {
      const editors = atom.workspace.getTextEditors()
      Promise.all(editors.map((editor) => editor.save())).then(() => {
        this.process.start(compilerPath, [flag, currentFilePath], { cwd: this.env.projectPath() })
        resolve()
      })
    })
  }

  compileAndRun () {
    return this.compile('-run')
  }
}
