'use babel'
import { CompositeDisposable } from 'atom'
import Debugger from '../../lib/debugger/debugger'

describe('Debugger', () => {
  describe('commands', () => {
    it('binds atom-agk:toggle-debugger', () => {
      const disposables = new CompositeDisposable()
      const debugManager = new Debugger(disposables)
      spyOn(debugManager, 'toggleDebugger')
      const workspaceElement = atom.views.getView(atom.workspace)

      atom.commands.dispatch(workspaceElement, 'atom-agk:toggle-debugger')

      expect(debugManager.toggleDebugger).toHaveBeenCalled()
    })

    it('binds atom-agk:debug', () => {
      const disposables = new CompositeDisposable()
      const debugManager = new Debugger(disposables)
      spyOn(debugManager, 'debug')
      const workspaceElement = atom.views.getView(atom.workspace)

      atom.commands.dispatch(workspaceElement, 'atom-agk:debug')

      expect(debugManager.debug).toHaveBeenCalled()
    })
  })
})
