'use babel'
import { spawn } from 'child_process'
import { Emitter } from 'atom'

export default class Compiler {
  constructor (disposables) {
    this.emitter = new Emitter()

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

    // save file before compiling
    // TODO: Save in all editors!
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
