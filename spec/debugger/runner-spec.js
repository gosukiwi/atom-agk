'use babel'
import { CompositeDisposable } from 'atom'
import Runner from '../../lib/debugger/runner'
import BreakpointManager from '../../lib/debugger/breakpoint_manager'
import Process from '../../lib/process'

function buildRunner () {
  const disposables = new CompositeDisposable()
  const interpreter = Process.null()
  const broadcaster = Process.null()
  const breakpoints = new BreakpointManager(disposables)
  const runner = new Runner({ breakpoints: breakpoints, interpreter: interpreter, broadcaster: broadcaster })

  return [runner, interpreter, broadcaster, breakpoints]
}

describe('Runner', () => {
  describe('.start', () => {
    it('tries to spawn the interpreter', () => {
      const [runner, interpreter] = buildRunner()
      spyOn(interpreter, 'start').andReturn(false)

      runner.start()

      expect(interpreter.start).toHaveBeenCalled()
    })

    it('halts when the interpreter fails to be spawned', () => {
      const [runner, interpreter, broadcaster] = buildRunner()
      spyOn(interpreter, 'start').andReturn(false)
      spyOn(broadcaster, 'start').andReturn(false)

      runner.start()

      expect(interpreter.start).toHaveBeenCalled()
      expect(broadcaster.start).not.toHaveBeenCalled()
    })

    it('tries to spawn the broadcaster if the interpreter was successfully spawned', () => {
      const [runner, , broadcaster] = buildRunner()
      spyOn(broadcaster, 'start').andReturn(true)

      runner.start()

      expect(broadcaster.start).toHaveBeenCalled()
    })

    it('does not mark as started if the interpreter failed to spawn', () => {
      const [runner, interpreter] = buildRunner()
      spyOn(interpreter, 'start').andReturn(false)

      runner.start()

      expect(runner.started).toBe(false)
    })

    it('does not mark as started if the broadcaster failed to spawn', () => {
      const [runner, , broadcaster] = buildRunner()
      spyOn(broadcaster, 'start').andReturn(false)

      runner.start()

      expect(runner.started).toBe(false)
    })

    it('marks as started if both processes spawn', () => {
      const [runner] = buildRunner()

      runner.start()

      expect(runner.started).toBe(true)
    })

    it('sends initial commands to the broadcaster', () => {
      const [runner, , broadcaster] = buildRunner()
      spyOn(broadcaster, 'writeStdin')

      runner.start()

      expect(broadcaster.writeStdin).toHaveBeenCalledWith(`setproject ${atom.project.getPaths()[0]}`)
      expect(broadcaster.writeStdin).toHaveBeenCalledWith('connect 127.0.0.1')
      expect(broadcaster.writeStdin).toHaveBeenCalledWith('debug')
    })

    it('sends breakpoints as commands to the broadcaster', () => {
      const [runner, , broadcaster, breakpoints] = buildRunner()
      breakpoints.breakpoints.push({ file: 'dummy.agc', line: 1 })
      breakpoints.breakpoints.push({ file: 'foo.agc', line: 3 })
      spyOn(broadcaster, 'writeStdin')

      runner.start()

      expect(broadcaster.writeStdin).toHaveBeenCalledWith('breakpoint dummy.agc:1')
      expect(broadcaster.writeStdin).toHaveBeenCalledWith('breakpoint foo.agc:3')
    })
  })

  describe('.send', () => {
    it('writes to broadcaster stdin', () => {
      const [runner, , broadcaster] = buildRunner()
      spyOn(broadcaster, 'writeStdin')

      runner.start()
      runner.send('hello, world!')

      expect(broadcaster.writeStdin).toHaveBeenCalledWith('hello, world!')
      expect(runner.started).toBe(true)
    })

    it('does not write to broadcaster stdin if stopped', () => {
      const [runner, , broadcaster] = buildRunner()
      spyOn(broadcaster, 'writeStdin')

      runner.send('hello, world!')

      expect(broadcaster.writeStdin).not.toHaveBeenCalled()
      expect(runner.started).toBe(false)
    })
  })

  describe('.stop', () => {
    it('stops the processes', () => {
      const [runner, interpreter, broadcaster] = buildRunner()
      runner.start()
      spyOn(interpreter, 'stop')
      spyOn(broadcaster, 'stop')

      runner.stop()

      expect(interpreter.stop).toHaveBeenCalled()
      expect(broadcaster.stop).toHaveBeenCalled()
      expect(runner.started).toBe(false)
    })
  })

  describe('.toggle', () => {
    it('starts when stopped', () => {
      const [runner] = buildRunner()
      runner.toggle()

      expect(runner.started).toBe(true)
    })

    it('stops when started', () => {
      const [runner] = buildRunner()
      runner.start()
      runner.toggle()

      expect(runner.started).toBe(false)
    })
  })
})
