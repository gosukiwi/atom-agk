'use babel'
import { CompositeDisposable } from 'atom'
import { fixture } from '../spec-helper'
import GoToDefinition from '../../lib/word-actions/go-to-definition'
import Suggestions from '../../lib/autocompletion/suggestions'

describe('GoToDefinition', () => {
  it('calls go when atom-agk:go-to-definition', () => {
    atom.project.setPaths([fixture('project-a')])
    const subscriptions = new CompositeDisposable()
    const goToDefinition = new GoToDefinition({ subscriptions })
    const suggestions = new Suggestions({ subscriptions })
    const workspaceElement = atom.views.getView(atom.workspace)
    let includedFileWasScanned = false
    spyOn(goToDefinition, 'open')

    suggestions.on('definition-set', ({ file }) => {
      if (file === fixture('project-b/main.agc')) includedFileWasScanned = true
    })

    waitsForPromise(() => atom.workspace.open('main.agc'))
    waitsFor(() => includedFileWasScanned)
    runs(() => {
      atom.workspace.getActiveTextEditor().setCursorBufferPosition([6, 0]) // a function definition
      atom.commands.dispatch(workspaceElement, 'atom-agk:go-to-definition')
      expect(goToDefinition.open).toHaveBeenCalledWith(fixture('project-b/main.agc'), 2)
      subscriptions.dispose()
    })
  })

  describe('.open', () => {
    it('opens the file in an editor and moves the cursor the the specified position', () => {
      const subscriptions = new CompositeDisposable()
      const goToDefinition = new GoToDefinition({ subscriptions })

      waitsForPromise(() => goToDefinition.open(fixture('project-b/main.agc'), 2))
      runs(() => {
        expect(atom.workspace.getActiveTextEditor().getCursorBufferPosition().row).toBe(1)
        expect(atom.workspace.getActiveTextEditor().getPath()).toBe(fixture('project-b/main.agc'))
      })
    })
  })
})
