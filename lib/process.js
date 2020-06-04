'use babel'
import { spawn } from 'child_process'
import { Emitter } from 'atom'

// A wrapper around Node's child processes and spawn
export default class Process {
  constructor () {
    this.running = false
    this.process = null
    this.emitter = new Emitter()
  }

  static null () {
    return new NullProcess()
  }

  start (path, args, opts) {
    if (this.running) return

    this.process = spawn(path, args || [], opts || {})
    this.running = this.process.pid !== undefined

    if (this.running) {
      this.process.stdout.on('data', (data) => this.emitter.emit('stdout', data))
      this.process.on('close', (data) => {
        this.running = false
        this.emitter.emit('close', data)
      })
    }

    return this.running
  }

  stop () {
    if (!this.running) return
    this.process.kill()
  }

  writeStdin (line) {
    if (!this.running) throw new Error('Cannot write to stopped process.')
    this.process.stdin.write(`${line}\r\n`)
  }

  onStdout (cb) {
    this.emitter.on('stdout', cb)
  }

  onClose (cb) {
    this.emitter.on('close', cb)
  }
}

class NullProcess {
  constructor () {
    this.running = false
    this.emitter = new Emitter()
  }

  start () {
    this.running = true
    return this.running
  }

  stop () {
    this.running = false
  }

  emit (name, args) {
    this.emitter.emit(name, args)
  }

  writeStdin (line) {}

  onStdout (cb) {
    this.emitter.on('stdout', cb)
  }

  onClose (cb) {
    this.emitter.on('close', cb)
  }
}
