'use babel'
import Process from '../lib/process'

describe('Process', () => {
  describe('.start', () => {
    it('calls spawn with the given params', () => {
      const spawn = jasmine.createSpy('spawn').andReturn({ pid: undefined })
      const process = new Process(spawn)

      process.start('foo', ['bar'], { baz: 1 })

      expect(spawn).toHaveBeenCalledWith('foo', ['bar'], { baz: 1 })
    })

    it('sets running to false if pid is undefined', () => {
      const spawn = jasmine.createSpy('spawn').andReturn({ pid: undefined })
      const process = new Process(spawn)

      process.start()

      expect(process.running).toBe(false)
    })

    it('sets running to true if pid is set', () => {
      const lambda = function () {}
      const spawn = jasmine.createSpy('spawn').andReturn({ pid: 1234, on: lambda, stdout: { on: lambda } })
      const process = new Process(spawn)

      process.start()

      expect(process.running).toBe(true)
    })

    it('calls onClose when process is closed', () => {
      const lambda = function () {}
      const on = function (arg, cb) {
        expect(arg).toBe('close')
        cb()
      }
      const spawn = jasmine.createSpy('spawn').andReturn({ pid: 1234, on: on, stdout: { on: lambda } })
      const process = new Process(spawn)
      let called = false
      process.onClose(() => { called = true })

      process.start()

      expect(called).toBe(true)
    })

    it('calls onStdout when process sends data', () => {
      const lambda = function () {}
      const on = function (arg, cb) {
        expect(arg).toBe('data')
        cb()
      }
      const spawn = jasmine.createSpy('spawn').andReturn({ pid: 1234, on: lambda, stdout: { on: on } })
      const process = new Process(spawn)
      let called = false
      process.onStdout(() => { called = true })

      process.start()

      expect(called).toBe(true)
    })
  })

  describe('.stop', () => {
    it('kills the process if running', () => {
      const lambda = function () {}
      const kill = jasmine.createSpy('kill')
      const spawn = jasmine.createSpy('spawn').andReturn({ pid: 1234, on: lambda, stdout: { on: lambda }, kill: kill })
      const process = new Process(spawn)

      process.start()
      process.stop()

      expect(kill).toHaveBeenCalled()
    })

    it('does not call kill if the process is stopped', () => {
      const lambda = function () {}
      const kill = jasmine.createSpy('kill')
      const spawn = jasmine.createSpy('spawn').andReturn({ pid: 1234, on: lambda, stdout: { on: lambda }, kill: kill })
      const process = new Process(spawn)

      process.stop()

      expect(kill).not.toHaveBeenCalled()
    })
  })

  describe('.writeStdin', () => {
    it('throws error if the process is not running', () => {
      const process = new Process()
      expect(process.writeStdin).toThrow()
    })

    it('writes to stdin if running', () => {
      const lambda = function () {}
      const write = jasmine.createSpy('write')
      const spawn = jasmine.createSpy('spawn').andReturn({ pid: 1234, on: lambda, stdout: { on: lambda }, stdin: { write: write } })
      const process = new Process(spawn)

      process.start()
      process.writeStdin('Hello, World!')

      expect(write).toHaveBeenCalledWith('Hello, World!\r\n')
    })
  })
})
