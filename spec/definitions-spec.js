'use babel'
import { CompositeDisposable } from 'atom'
import Definitions from '../lib/definitions'
import path from 'path'

function fixture (name) {
  return path.join(__dirname, 'fixtures', name)
}

describe('Definitions', () => {
  it('calls open when atom-agk:open-definition', () => {
    const subscriptions = new CompositeDisposable()
    const definitions = new Definitions(subscriptions)
    const workspaceElement = atom.views.getView(atom.workspace)
    spyOn(definitions, 'open')

    atom.commands.dispatch(workspaceElement, 'atom-agk:open-definition')

    expect(definitions.open).toHaveBeenCalled()
  })

  //describe('.open', () => {
  //  it('tries to get the word under cursor', () => {
  //    const subscriptions = new CompositeDisposable()
  //    const definitions = new Definitions(subscriptions)
  //    spyOn(definitions, 'getWordAtColumn')
  //    atom.workspace.open(fixture('demo.agc')).then((editor) => {
  //      editor.setCursorBufferPosition([1, 2])
//
  //      definitions.open()
//
  //      expect(definitions.getWordAtColumn).toHaveBeenCalledWith('  Print("Hi")', 2)
  //    })
  //  })
  //})

  describe('.getWordAtColumn', () => {
    it('finds the proper word', () => {
      const subscriptions = new CompositeDisposable()
      const definitions = new Definitions(subscriptions)

      const match = definitions.getWordAtColumn('  Print()', 2)

      expect(match).toBe('Print')
    })
  })
})
