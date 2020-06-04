'use babel'

import path from 'path'
import { Emitter } from 'atom'
import Process from './process'

// This class is in charge of running and orchestrating the different
// executables required for debugging.
export default class Runner {
  constructor ({ breakpoints, interpreter, broadcaster }) {
    this.breakpoints = breakpoints
    this.interpreterProcess = interpreter || new Process(path.join(this.getCompilerDir(), 'interpreters', 'Windows.exe'))
    this.broadcasterProcess = broadcaster || new Process(path.join(this.getCompilerDir(), 'AGKBroadcaster.exe'), ['-nowindow'])
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

    // this.broadcasterProcess.stdin.write(`${command}\r\n`)
    this.broadcasterProcess.writeStdin(command)
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
    if (!this.interpreterProcess.start()) {
      this.out(`Failed to open interpreter. Could not find it in "${this.interpreterProcess.path}".`)
      return
    }

    if (!this.broadcasterProcess.start()) {
      this.out(`Failed to open broadcaster. Could not find it in "${this.broadcasterProcess.path}".`)
      return
    }

    this.started = true
    this.out('Connected!')

    // this.broadcasterProcess.stdout.on('data', (data) => {
    this.broadcasterProcess.onStdout((data) => {
      this.out(`< ${data}`)
      this.watching.forEach((variableExpression) => {
        this.unwatch(variableExpression)
      })
      this.watching = []
    })

    // this.broadcasterProcess.stdin.setEncoding('utf-8')
    this.send(`setproject ${this.getProjectPath()}`)
    this.send('connect 127.0.0.1')
    this.breakpoints.each((breakpoint) => {
      this.send(`breakpoint ${breakpoint.file}:${breakpoint.line}`)
    })
    this.send('debug')

    // stop when interpreter closes
    this.interpreterProcess.onClose(() => this.stop())
  }

  stop () {
    this.interpreterProcess.stop()
    this.broadcasterProcess.stop()
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
