'use babel'
import { CompositeDisposable } from 'atom'
import Debugger from '../../lib/debugger/debugger'
import Runner from '../../lib/debugger/runner'
import Process from '../../lib/process'
import Compiler from '../../lib/compiler'
import BreakpointManager from '../../lib/debugger/breakpoint_manager'
import Terminal from '../../lib/terminal/terminal'

function buildDebugger () {
  const subscriptions = new CompositeDisposable()
  const process = Process.null()
  const compiler = new Compiler({ subscriptions, process })
  const breakpoints = new BreakpointManager(subscriptions)
  const runner = new Runner({ breakpoints })
  const terminal = new Terminal(subscriptions)
  const debugManager = new Debugger({ subscriptions, compiler, runner, terminal })

  return { compiler, runner, terminal, debugManager }
}

describe('Debugger', () => {
  describe('commands', () => {
    it('binds "atom-agk:debug" to .start', () => {
      const { debugManager } = buildDebugger()
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(debugManager, 'start')

      atom.commands.dispatch(workspaceElement, 'atom-agk:debug')

      expect(debugManager.start).toHaveBeenCalled()
    })
  })

  describe('.start', () => {
    it('calls compile', () => {
      const { debugManager, compiler } = buildDebugger()
      spyOn(compiler, 'compile')

      debugManager.start()

      expect(compiler.compile).toHaveBeenCalled()
    })

    // it('starts the runner', () => {
    //   const { debugManager, runner } = buildDebugger()
    //   spyOn(runner, 'start')
    //   waitsForPromise(() => atom.workspace.open('foo.agc'))
    //   waitsForPromise(() => debugManager.start())
    //   runs(() => {
    //     expect(runner.start).toHaveBeenCalled()
    //   })
    // })
  })

  it('sends watch to runner on terminal.onCommandEntered', () => {
    const { runner, terminal } = buildDebugger()
    spyOn(runner, 'watch')

    terminal.emit('command-entered', 'foo')

    expect(runner.watch).toHaveBeenCalledWith('foo')
  })

  it('stops runner on terminal.onTogglePressed', () => {
    const { runner, terminal } = buildDebugger()
    spyOn(runner, 'toggle')

    terminal.emit('toggle-pressed')

    expect(runner.toggle).toHaveBeenCalled()
  })

  it('continues runner on terminal.onContinuePressed', () => {
    const { runner, terminal } = buildDebugger()
    spyOn(runner, 'continue')

    terminal.emit('continue-pressed')

    expect(runner.continue).toHaveBeenCalled()
  })

  it('highlights breakpoint if needed', () => {
    const { runner, debugManager } = buildDebugger()
    spyOn(debugManager, 'highlightBreakpointIfNeeded')

    runner.out('< Break:foo.agc:3 Some More Text')

    expect(debugManager.highlightBreakpointIfNeeded).toHaveBeenCalled()
  })
})
