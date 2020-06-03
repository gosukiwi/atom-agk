'use babel'
import { CompositeDisposable } from 'atom'
import { Readable, Writable } from 'stream'
import { EventEmitter } from 'events'
import Runner from '../../lib/debugger/runner'
import BreakpointManager from '../../lib/debugger/breakpoint_manager'
import Spawner from '../../lib/debugger/spawner'

function mockProcess () {
  const dummyProcess = new EventEmitter()
  dummyProcess.stdin = new Writable({
    write () {},
    final () {}
  })
  dummyProcess.stdin.setEncoding = () => {}
  dummyProcess.stdout = new Readable({
    read () {}
  })
  dummyProcess.stderr = new Readable({
    read () {}
  })

  return dummyProcess
}

describe('Runner', () => {
  describe('\\#start', () => {
    it('tries to spawn the interpreter', () => {
      atom.config.set('atom-agk.agk_compiler_path', 'C:\\Foo\\bar')
      const disposables = new CompositeDisposable()
      const spawner = new Spawner()
      const runner = new Runner(new BreakpointManager(disposables), spawner)
      spyOn(spawner, 'spawn').andReturn(null)

      runner.start()

      expect(spawner.spawn).toHaveBeenCalledWith('C:\\Foo\\interpreters\\Windows.exe')
    })

    it('halts when the interpreter fails to be spawned', () => {
      atom.config.set('atom-agk.agk_compiler_path', 'C:\\Foo\\bar')
      const disposables = new CompositeDisposable()
      const spawner = new Spawner()
      const runner = new Runner(new BreakpointManager(disposables), spawner)
      spyOn(spawner, 'spawn').andReturn(null)

      runner.start()

      expect(spawner.spawn).toHaveBeenCalledWith('C:\\Foo\\interpreters\\Windows.exe')
      expect(spawner.spawn).not.toHaveBeenCalledWith('C:\\Foo\\AGKBroadcaster.exe')
    })

    it('tries to spawn the broadcaster if the interpreter was successfully spawned', () => {
      atom.config.set('atom-agk.agk_compiler_path', 'C:\\Foo\\bar')
      const disposables = new CompositeDisposable()
      const spawner = new Spawner()
      const runner = new Runner(new BreakpointManager(disposables), spawner)
      spyOn(spawner, 'spawn').andCallFake((path, args) => {
        if (path === 'C:\\Foo\\interpreters\\Windows.exe') return {}
        return null
      })

      runner.start()

      expect(spawner.spawn).toHaveBeenCalledWith('C:\\Foo\\interpreters\\Windows.exe')
      expect(spawner.spawn).toHaveBeenCalledWith('C:\\Foo\\AGKBroadcaster.exe', ['-nowindow'])
    })

    it('does not mark as started if any process fails to spawn', () => {
      atom.config.set('atom-agk.agk_compiler_path', 'C:\\Foo\\bar')
      const disposables = new CompositeDisposable()
      const spawner = new Spawner()
      const runner = new Runner(new BreakpointManager(disposables), spawner)
      spyOn(spawner, 'spawn').andCallFake((path, args) => {
        if (path === 'C:\\Foo\\interpreters\\Windows.exe') return {}
        return null
      })

      runner.start()

      expect(runner.started).toBe(false)
    })

    it('does not mark as started if any process fails to spawn', () => {
      atom.config.set('atom-agk.agk_compiler_path', 'C:\\Foo\\bar')
      const disposables = new CompositeDisposable()
      const spawner = new Spawner()
      const runner = new Runner(new BreakpointManager(disposables), spawner)
      spyOn(spawner, 'spawn').andReturn(mockProcess())

      runner.start()

      expect(runner.started).toBe(true)
    })
  })
})
