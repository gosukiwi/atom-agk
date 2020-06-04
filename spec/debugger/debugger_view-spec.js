'use babel'
import DebuggerView from '../../lib/debugger/debugger_view'

describe('DebuggerView', () => {
  describe('.writeLine', () => {
    it('adds a new line to the output', () => {
      const view = new DebuggerView({ started: false })

      view.writeLine('Hello, World!')

      expect(view.getElement().querySelector('.agk-debugger__output').innerHTML).toContain('Hello, World!')
    })
  })

  describe('.clear', () => {
    it('clear the output', () => {
      const view = new DebuggerView({ started: false })

      view.writeLine('Hello, World!')
      view.clear()

      expect(view.getElement().querySelector('.agk-debugger__output').innerHTML).not.toContain('Hello, World!')
    })

    it('adds default text', () => {
      const view = new DebuggerView({ started: false })

      view.clear()

      expect(view.getElement().querySelector('.agk-debugger__output').innerHTML).toContain('AGK Debugger Console. Not connected.')
    })
  })
})
