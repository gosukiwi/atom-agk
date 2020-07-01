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

      this.terminal.open().then(() => {
        this.goToFirstError(data)
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
    return this.emitter.on('compiler-failed', cb)
  }

  onCompilationSucceeded (cb) {
    return this.emitter.on('compiler-succeeded', cb)
  }

  compile (flag = '-agk') {
    const currentEditor = atom.workspace.getActiveTextEditor()
    const currentFilePath = currentEditor.getPath()
    const compilerPath = this.env.compilerPath()

    const args = [flag]
    if (atom.config.get('atom-agk.x64')) {
      args.push('-64')
    }
    args.push(currentFilePath)

    this.terminal.write('Compiling...')
    return new Promise((resolve, reject) => {
      const editors = atom.workspace.getTextEditors()
      Promise.all(editors.map((editor) => editor.save())).then(() => {
        this.process.start(compilerPath, args, { cwd: this.env.projectPath() })
        resolve()
      })
    })
  }

  compileAndRun () {
    return this.compile('-run')
  }

  goToFirstError (output) {
    const [file, line] = output.trim().split(':')
    if (isNaN(parseInt(line))) return

    atom.workspace.open(this.env.join(this.env.projectPath(), file), { initialLine: line - 1 })
  }
}
