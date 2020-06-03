'use babel'

import path from 'path'
import { Emitter } from 'atom'
import Spawner from './spawner'

// This class is in charge of running and orchestrating the different
// executables required for debugging.
export default class Runner {
  constructor (breakpoints, spawner) {
    this.breakpoints = breakpoints
    this.spawner = spawner || new Spawner()
    this.emitter = new Emitter()
    this.started = false
    this.interpreterProcess = null
    this.broadcasterProcess = null
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

    this.broadcasterProcess.stdin.write(`${command}\r\n`)
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
    this.interpreterProcess = this.startInterpreter()
    if (this.interpreterProcess === null) return
    this.broadcasterProcess = this.startBroadcaster()
    if (this.broadcasterProcess === null) return

    this.started = true
    this.out('Connected!')

    this.broadcasterProcess.stdout.on('data', (data) => {
      this.out(`< ${data}`)
      this.watching.forEach((variableExpression) => {
        this.unwatch(variableExpression)
      })
      this.watching = []
    })

    this.broadcasterProcess.stdin.setEncoding('utf-8')
    this.broadcasterProcess.stdin.write(`setproject ${this.getProjectPath()}\r\n`)
    this.broadcasterProcess.stdin.write('connect 127.0.0.1\r\n')
    this.breakpoints.each((breakpoint) => {
      this.broadcasterProcess.stdin.write(`breakpoint ${breakpoint.file}:${breakpoint.line}\r\n`)
    })
    this.broadcasterProcess.stdin.write('debug\r\n')

    // stop when interpreter closes
    this.interpreterProcess.on('close', () => this.stop())
  }

  stop () {
    this.interpreterProcess && this.interpreterProcess.kill()
    this.broadcasterProcess && this.broadcasterProcess.kill()
    this.interpreterProcess = null
    this.broadcasterProcess = null
    this.started = false
    this.out('Done. Disconnected.')
  }

  // private

  startInterpreter () {
    const interpreterPath = path.join(this.getCompilerDir(), 'interpreters', 'Windows.exe')
    const process = this.spawner.spawn(interpreterPath)
    if (process === null) {
      this.out(`Failed to open interpreter. Could not find it in "${interpreterPath}".`)
      return null
    }

    return process
  }

  startBroadcaster () {
    const broadcasterPath = path.join(this.getCompilerDir(), 'AGKBroadcaster.exe')
    const process = this.spawner.spawn(broadcasterPath, ['-nowindow'])
    if (process === null) {
      this.out(`Failed to open broardcaster. Could not find it in "${broadcasterPath}".`)
      return null
    }

    return process
  }

  getCompilerDir () {
    return path.dirname(atom.config.get('atom-agk.agk_compiler_path'))
  }

  getProjectPath () {
    return atom.project.getPaths()[0]
  }
}
