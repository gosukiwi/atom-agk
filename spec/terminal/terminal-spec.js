'use babel'
import { CompositeDisposable } from 'atom'
import Terminal from '../../lib/terminal/terminal'

describe('Terminal', () => {
  describe('commands', () => {
    it('binds atom-agk:toggle-terminal to .toggleTerminalWindow', () => {
      const subscriptions = new CompositeDisposable()
      const terminal = new Terminal(subscriptions)
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(terminal, 'toggleTerminalWindow')

      atom.commands.dispatch(workspaceElement, 'atom-agk:toggle-terminal')

      expect(terminal.toggleTerminalWindow).toHaveBeenCalled()
    })
  })

  describe('.write', () => {
    it('adds a new line to the output', () => {
      const subscriptions = new CompositeDisposable()
      const terminal = new Terminal(subscriptions)
      spyOn(terminal.view, 'write')

      terminal.write('Hello, World!')

      expect(terminal.view.write).toHaveBeenCalled()
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
