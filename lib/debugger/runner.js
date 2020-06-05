'use babel'

import { Emitter } from 'atom'
import Process from '../process'
import Environment from '../environment'

// This class is in charge of running and orchestrating the different
// executables required for debugging.
export default class Runner {
  constructor ({ breakpoints, interpreter, broadcaster, environment }) {
    this.breakpoints = breakpoints
    this.interpreter = interpreter || new Process()
    this.broadcaster = broadcaster || new Process()
    this.environment = environment || new Environment()
    this.emitter = new Emitter()
    this.started = false
    this.watching = []

    this.broadcaster.onStdout((data) => {
      this.out(`< ${data}`)
      this.watching.forEach((variableExpression) => {
        this.unwatch(variableExpression)
      })
      this.watching = []
    })
  }

  out (text) {
    this.emitter.emit('out', text)
  }

  onOutput (cb) {
    this.emitter.on('out', cb)
  }

  onStarted (cb) {
    this.emitter.on('started', cb)
  }

  onStopped (cb) {
    this.emitter.on('stopped', cb)
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
    if (!this.interpreter.start(this.interpreterPath)) {
      this.out(`Failed to open interpreter. Could not find it in "${this.interpreterPath}".`)
      return
    }

    if (!this.broadcaster.start(this.broadcasterPath, ['-nowindow'])) {
      this.out(`Failed to open broadcaster. Could not find it in "${this.broadcasterPath}".`)
      return
    }

    this.started = true
    this.emitter.emit('started')
    this.out('Connected!')
    this.send(`setproject ${this.projectPath}`)
    this.send('connect 127.0.0.1')
    this.breakpoints.each((breakpoint) => {
      this.send(`breakpoint ${breakpoint.file}:${breakpoint.line}`)
    })
    this.send('debug')

    this.interpreter.onClose(() => this.stop())
  }

  stop () {
    if (!this.started) return

    this.interpreter.stop()
    this.broadcaster.stop()
    this.started = false
    this.emitter.emit('stopped')
    this.out('Done. Disconnected.')
  }

  toggle () {
    if (this.started) {
      this.stop()
    } else {
      this.start()
    }
  }

  // private

  get broadcasterPath () {
    return this.environment.broadcasterPath()
  }

  get interpreterPath () {
    return this.environment.interpreterPath()
  }

  get projectPath () {
    return this.environment.projectPath()
  }
}
