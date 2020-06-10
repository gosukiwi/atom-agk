'use babel'
import { CompositeDisposable } from 'atom'
// import { fixture } from './spec-helper'
import DefinitionOpener from '../lib/definition-opener'
import Environment from '../lib/environment'

describe('DefinitionOpener', () => {
  it('calls open when atom-agk:open-definition', () => {
    const subscriptions = new CompositeDisposable()
    const opener = new DefinitionOpener({ subscriptions })
    const workspaceElement = atom.views.getView(atom.workspace)
    spyOn(opener, 'open')

    atom.commands.dispatch(workspaceElement, 'atom-agk:open-definition')

    expect(opener.open).toHaveBeenCalled()
  })

  describe('.open', () => {
    it('calls opener', () => {
      const environment = new Environment()
      const subscriptions = new CompositeDisposable()
      const opener = new DefinitionOpener({ subscriptions, environment })
      spyOn(environment, 'compilerPath').andReturn('C:\\Compiler.exe')
      spyOn(opener, 'opener')

      waitsForPromise(() => atom.workspace.open('demo.agc'))
      runs(() => {
        opener.open()

        expect(opener.opener).toHaveBeenCalled()
      })
    })
  })

  describe('.getWordAtColumn', () => {
    it('finds the proper word', () => {
      const subscriptions = new CompositeDisposable()
      const opener = new DefinitionOpener({ subscriptions })

      const match = opener.getWordAtColumn('  Print()', 2)

      expect(match).toBe('Print')
    })
  })

  describe('.findCommand', () => {
    it('finds a command by name', () => {
      const subscriptions = new CompositeDisposable()
      const dummyCommand = { name: 'potato' }
      const opener = new DefinitionOpener({ subscriptions, definitions: [dummyCommand] })

      expect(opener.findCommand('potato')).toBe(dummyCommand)
    })

    it('is case insensitive', () => {
      const subscriptions = new CompositeDisposable()
      const dummyCommand = { name: 'potato' }
      const opener = new DefinitionOpener({ subscriptions, definitions: [dummyCommand] })

      expect(opener.findCommand('POTato')).toBe(dummyCommand)
    })
  })
})
