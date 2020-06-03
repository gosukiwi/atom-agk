'use babel'
import { CompositeDisposable } from 'atom'
import Debugger from '../../lib/debugger/debugger'
import Runner from '../../lib/debugger/runner'
import BreakpointManager from '../../lib/debugger/breakpoint_manager'

describe('Debugger', () => {
  describe('commands', () => {
    it('binds atom-agk:toggle-debugger to #toggleDebugger', () => {
      const disposables = new CompositeDisposable()
      const breakpoints = new BreakpointManager(disposables)
      const runner = new Runner(breakpoints)
      const debugManager = new Debugger(disposables, runner)
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(debugManager, 'toggleDebugger')

      atom.commands.dispatch(workspaceElement, 'atom-agk:toggle-debugger')

      expect(debugManager.toggleDebugger).toHaveBeenCalled()
    })

    it('binds "atom-agk:debug" to #debug', () => {
      const disposables = new CompositeDisposable()
      const breakpoints = new BreakpointManager(disposables)
      const runner = new Runner(breakpoints)
      const debugManager = new Debugger(disposables, runner)
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(debugManager, 'debug')

      atom.commands.dispatch(workspaceElement, 'atom-agk:debug')

      expect(debugManager.debug).toHaveBeenCalled()
    })
  })

  describe('#debug', () => {
    it('starts the runner', () => {
      const disposables = new CompositeDisposable()
      const breakpoints = new BreakpointManager(disposables)
      const runner = new Runner(breakpoints)
      const debugManager = new Debugger(disposables, runner)
      spyOn(runner, 'start')

      debugManager.debug()

      expect(runner.start).toHaveBeenCalled()
    })
  })
})
