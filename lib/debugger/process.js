'use babel'
import { spawn } from 'child_process'

// A wrapper around Node's child processes and spawn
export default class Process {
  constructor (path, args) {
    this.path = path
    this.args = args || []
    this.running = false
    this.process = null
  }

  static null (path, args) {
    return new NullProcess(path || '', args)
  }

  start () {
    if (this.running) return

    this.process = spawn(this.path, this.args)
    this.running = this.process.pid !== undefined
    return this.running
  }

  stop () {
    if (!this.running) return
    this.process.kill()
  }

  writeStdin (line) {
    this.process.stdin.write(`${line}\r\n`)
  }

  onStdout (cb) {
    this.process.stdout.on('data', cb)
  }

  onClose (cb) {
    this.process.on('close', cb)
  }
}

class NullProcess {
  constructor (path, args) {
    this.path = path
    this.args = args || []
    this.running = false
  }

  start () {
    this.running = true
    return this.running
  }

  stop () {
    this.running = false
  }

  writeStdin (line) {}
  onStdout (cb) {}
  onClose (cb) {}
}
