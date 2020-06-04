'use babel'
import { CompositeDisposable } from 'atom'
import Debugger from '../../lib/debugger/debugger'
import Runner from '../../lib/debugger/runner'
import BreakpointManager from '../../lib/debugger/breakpoint_manager'
import DebuggerView from '../../lib/debugger/debugger_view'

describe('Debugger', () => {
  describe('commands', () => {
    it('binds atom-agk:toggle-debugger to \\#toggleDebuggerWindow', () => {
      const disposables = new CompositeDisposable()
      const debugManager = new Debugger({ subscriptions: disposables })
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(debugManager, 'toggleDebuggerWindow')

      atom.commands.dispatch(workspaceElement, 'atom-agk:toggle-debugger')

      expect(debugManager.toggleDebuggerWindow).toHaveBeenCalled()
    })

    it('binds "atom-agk:debug" to \\#debug', () => {
      const disposables = new CompositeDisposable()
      const debugManager = new Debugger({ subscriptions: disposables })
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(debugManager, 'debug')

      atom.commands.dispatch(workspaceElement, 'atom-agk:debug')

      expect(debugManager.debug).toHaveBeenCalled()
    })
  })

  it('opens the view on atom://agk-debugger', () => {
    const disposables = new CompositeDisposable()
    const view = new DebuggerView()
    new Debugger({ subscriptions: disposables, view: view })
    spyOn(view, 'getDefaultLocation')

    waitsForPromise(() => atom.workspace.open(view.getURI()))
    runs(() => expect(view.getDefaultLocation).toHaveBeenCalled())
  })

  it('sends commands to runner\\#watch on view command entered', () => {
    const disposables = new CompositeDisposable()
    const breakpoints = new BreakpointManager(disposables)
    const runner = new Runner({ breakpoints })
    const view = new DebuggerView()
    new Debugger({ subscriptions: disposables, runner: runner, view: view })
    spyOn(runner, 'watch')

    view.emit('command-entered', 'foo')

    expect(runner.watch).toHaveBeenCalledWith('foo')
  })

  describe('\\#debug', () => {
    it('starts the runner', () => {
      const disposables = new CompositeDisposable()
      const breakpoints = new BreakpointManager(disposables)
      const runner = new Runner({ breakpoints })
      const debugManager = new Debugger({ subscriptions: disposables, runner: runner })
      spyOn(runner, 'start')

      debugManager.debug()

      expect(runner.start).toHaveBeenCalled()
    })
  })
})
