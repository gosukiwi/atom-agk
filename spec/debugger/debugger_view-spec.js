'use babel'
import DebuggerView from '../../lib/debugger/debugger_view'

describe('DebuggerView', () => {
  describe('.writeLine', () => {
    it('adds a new line to the output', () => {
      const view = new DebuggerView()

      view.writeLine('Hello, World!')

      expect(view.state.console).toContain('Hello, World!')
    })
  })

  describe('.clear', () => {
    it('clear the output', () => {
      const view = new DebuggerView()

      view.writeLine('Hello, World!')
      view.clear()

      expect(view.state.console).not.toContain('Hello, World!')
    })

    it('adds default text', () => {
      const view = new DebuggerView()

      view.clear()

      expect(view.getElement().querySelector('.agk-debugger__output ul').innerHTML).toBe('')
    })
  })
})
