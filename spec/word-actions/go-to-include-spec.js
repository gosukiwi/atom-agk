'use babel'
import { CompositeDisposable } from 'atom'
import { fixture } from '../spec-helper'
import GoToInclude from '../../lib/word-actions/go-to-include'

describe('GoToInclude', () => {
  it('calls go when atom-agk:go-to-definition', () => {
    atom.project.setPaths([fixture('project-a')])
    const subscriptions = new CompositeDisposable()
    const goToInclude = new GoToInclude({ subscriptions })
    const workspaceElement = atom.views.getView(atom.workspace)
    spyOn(goToInclude, 'open')

    waitsForPromise(() => atom.workspace.open('main.agc'))
    runs(() => {
      atom.workspace.getActiveTextEditor().setCursorBufferPosition([0, 0]) // an `#include`
      atom.commands.dispatch(workspaceElement, 'atom-agk:go-to-include')
      expect(goToInclude.open).toHaveBeenCalledWith(fixture('project-b/main.agc'))
      subscriptions.dispose()
    })
  })

  describe('.open', () => {
    it('opens the file in an editor and moves the cursor the the specified position', () => {
      const subscriptions = new CompositeDisposable()
      const goToInclude = new GoToInclude({ subscriptions })

      waitsForPromise(() => goToInclude.open(fixture('project-b/main.agc')))
      runs(() => {
        expect(atom.workspace.getActiveTextEditor().getPath()).toBe(fixture('project-b/main.agc'))
      })
    })
  })
})
