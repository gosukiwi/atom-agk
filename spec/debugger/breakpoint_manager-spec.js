'use babel'
import { CompositeDisposable } from 'atom'
import BreakpointManager from '../../lib/debugger/breakpoint_manager'

describe('BreakpointManager', () => {
  describe('commands', () => {
    it('binds atom-agk:toggle-breakpoint to .toggle', () => {
      const subscriptions = new CompositeDisposable()
      const manager = new BreakpointManager(subscriptions)
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(manager, 'toggle')

      atom.commands.dispatch(workspaceElement, 'atom-agk:toggle-breakpoint')

      expect(manager.toggle).toHaveBeenCalled()
    })
  })

  describe('.toggle', () => {
    it('toggles a breakpoint', () => {
      const subscriptions = new CompositeDisposable()
      const manager = new BreakpointManager(subscriptions)

      waitsForPromise(() => atom.workspace.open('foo.agc'))
      runs(() => {
        manager.toggle()
        expect(manager.breakpoints.length).toBe(1)
        expect(manager.breakpoints[0].file).toBe('foo.agc')
        expect(manager.breakpoints[0].line).toBe(0)
        expect(manager.breakpoints[0].decoration).toBeDefined()

        manager.toggle()
        expect(manager.breakpoints.length).toBe(0)
      })
    })
  })
})
