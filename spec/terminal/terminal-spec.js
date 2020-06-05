'use babel'
import { CompositeDisposable } from 'atom'
import Terminal from '../../lib/terminal/terminal'

describe('Terminal', () => {
  describe('commands', () => {
    it('binds atom-agk:toggle-debugger to .toggleDebuggerWindow', () => {
      const subscriptions = new CompositeDisposable()
      const terminal = new Terminal(subscriptions)
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(terminal, 'toggleDebuggerWindow')

      atom.commands.dispatch(workspaceElement, 'atom-agk:toggle-debugger')

      expect(terminal.toggleDebuggerWindow).toHaveBeenCalled()
    })
  })

  describe('.write', () => {
    it('adds a new line to the output', () => {
      const subscriptions = new CompositeDisposable()
      const terminal = new Terminal(subscriptions)

      terminal.write('Hello, World!')

      expect(terminal.view.state.console).toContain('Hello, World!')
    })
  })

  describe('.clear', () => {
    it('clear the output', () => {
      const subscriptions = new CompositeDisposable()
      const terminal = new Terminal(subscriptions)

      terminal.write('Hello, World!')
      terminal.clear()

      expect(terminal.view.state.console).not.toContain('Hello, World!')
    })

    it('adds default text', () => {
      const subscriptions = new CompositeDisposable()
      const terminal = new Terminal(subscriptions)

      terminal.clear()

      expect(terminal.getElement().querySelector('.agk-debugger__output ul').innerHTML).toBe('')
    })
  })

  it('opens the terminal on atom://agk-debugger', () => {
    const subscriptions = new CompositeDisposable()
    const terminal = new Terminal(subscriptions)
    spyOn(terminal, 'getDefaultLocation')

    waitsForPromise(() => atom.workspace.open(terminal.getURI()))
    runs(() => expect(terminal.getDefaultLocation).toHaveBeenCalled())
  })
})
