'use babel'
import { CompositeDisposable } from 'atom'
import BreakpointManager from '../../lib/debugger/breakpoint_manager'

describe('BreakpointManager', () => {
  describe('commands', () => {
    it('binds atom-agk:add-breakpoint to .add', () => {
      const subscriptions = new CompositeDisposable()
      const manager = new BreakpointManager(subscriptions)
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(manager, 'add')

      atom.commands.dispatch(workspaceElement, 'atom-agk:add-breakpoint')

      expect(manager.add).toHaveBeenCalled()
    })
  })

  describe('.add', () => {
    it('adds a new breakpoint', () => {
      const subscriptions = new CompositeDisposable()
      const manager = new BreakpointManager(subscriptions)

      waitsForPromise(() => atom.workspace.open('foo.agc'))
      runs(() => {
        manager.add()
        expect(manager.breakpoints.length).toBe(1)
        expect(manager.breakpoints[0].file).toBe('foo.agc')
        expect(manager.breakpoints[0].line).toBe(0)
        expect(manager.breakpoints[0].decoration).toBeDefined()
      })
    })
  })
})
