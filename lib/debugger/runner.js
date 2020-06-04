'use babel'

import path from 'path'
import { Emitter } from 'atom'
import Process from './process'

// This class is in charge of running and orchestrating the different
// executables required for debugging.
export default class Runner {
  constructor ({ breakpoints, interpreter, broadcaster }) {
    this.breakpoints = breakpoints
    this.interpreter = interpreter || new Process(path.join(this.getCompilerDir(), 'interpreters', 'Windows.exe'))
    this.broadcaster = broadcaster || new Process(path.join(this.getCompilerDir(), 'AGKBroadcaster.exe'), ['-nowindow'])
    this.emitter = new Emitter()
    this.started = false
    this.watching = []
  }

  out (text) {
    this.emitter.emit('out', text)
  }

  onOutput (cb) {
    this.emitter.on('out', cb)
  }

  send (command) {
    if (!this.started) {
      this.out('Not connected.')
      return
    }

    this.broadcaster.writeStdin(command)
  }

  watch (variableExpression) {
    this.send(`watch ${variableExpression}`)
    this.watching.push(variableExpression)
  }

  unwatch (variableExpression) {
    this.send(`delete watch ${variableExpression}`)
    this.watching.push(variableExpression)
  }

  continue () {
    this.send('continue')
  }

  start () {
    if (this.started) {
      this.out('[DEBUG] Already started. Ignoring.')
      return
    }

    this.out('Connecting...')
    if (!this.interpreter.start()) {
      this.out(`Failed to open interpreter. Could not find it in "${this.interpreter.path}".`)
      return
    }

    if (!this.broadcaster.start()) {
      this.out(`Failed to open broadcaster. Could not find it in "${this.broadcaster.path}".`)
      return
    }

    this.started = true
    this.out('Connected!')

    this.broadcaster.onStdout((data) => {
      this.out(`< ${data}`)
      this.watching.forEach((variableExpression) => {
        this.unwatch(variableExpression)
      })
      this.watching = []
    })

    this.send(`setproject ${this.getProjectPath()}`)
    this.send('connect 127.0.0.1')
    this.breakpoints.each((breakpoint) => {
      this.send(`breakpoint ${breakpoint.file}:${breakpoint.line}`)
    })
    this.send('debug')

    this.interpreter.onClose(() => this.stop())
  }

  stop () {
    this.interpreter.stop()
    this.broadcaster.stop()
    this.started = false
    this.out('Done. Disconnected.')
  }

  // private

  getCompilerDir () {
    return path.dirname(`${atom.config.get('atom-agk.agk_compiler_path')}`)
  }

  getProjectPath () {
    return atom.project.getPaths()[0]
  }
}
