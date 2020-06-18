'use babel'
import { CompositeDisposable } from 'atom'
import { fixture, normalizePath, removeFile } from '../spec-helper'
import Environment from '../../lib/environment'
import Suggestions from '../../lib/autocompletion/suggestions'

function build () {
  const subscriptions = new CompositeDisposable()
  const environment = Environment.instance
  const suggestions = new Suggestions({ subscriptions, environment })
  return { subscriptions, environment, suggestions }
}

describe('Suggestions', () => {
  it('loads built-in definitions', () => {
    const { suggestions } = build()

    expect(suggestions.get('setspr').find((definition) => definition.name === 'SetSpriteAnimation')).not.toBeUndefined()
  })

  it('scans definitions in a project', () => {
    atom.project.setPaths([fixture('project-a')])
    const { suggestions, subscriptions } = build()

    const disposable = suggestions.on('was-set', (file) => {
      expect(file).toContain(normalizePath('project-a/main.agc'))
      expect(suggestions.get('projectafunc').find((definition) => definition.name === 'ProjectAFunc')).not.toBeUndefined()
      expect(suggestions.get('projectcfunc').find((definition) => definition.name === 'ProjectCFunc')).toBeUndefined()
      subscriptions.dispose()
      disposable.dispose()
    })
  })

  it('does not scan includes if the file is not saved')
  it('does scan includes once the file is saved')
  it('removes the in-memory representation once a file is saved')

  it('scans included files in a project file', () => {
    atom.project.setPaths([fixture('project-a')])
    const { suggestions, subscriptions } = build()
    let called = false

    const disposable = suggestions.on('was-set', (file) => {
      if (!file.endsWith(normalizePath('project-b/main.agc'))) return
      called = true
      subscriptions.dispose()
      disposable.dispose()
    })

    waitsFor(() => called)
    runs(() => {
      expect(suggestions.get('projectb').find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
    })
  })

  it('scans included files in an included file')

  it('removes definitions when a file in a project is removed', () => {
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()

    let buffer = null
    waitsForPromise(() => atom.workspace.open('dummy.agc'))
    runs(async () => {
      buffer = atom.workspace.getActiveTextEditor().getBuffer()
      buffer.setText('dummy123 = 1')
      buffer.save()

      const disposable = suggestions.on('was-set', (file) => {
        if (!file.endsWith('dummy.agc')) return

        expect(suggestions.get('dummy').find((definition) => definition.name === 'dummy123')).not.toBeUndefined()
        subscriptions.dispose()
        disposable.dispose()
      })
    })

    suggestions.on('cleared', (file) => {
      expect(file.endsWith('dummy.agc')).toBe(false)
    })
    removeFile(fixture('project-c/dummy.agc'))
  })

  it('removes definitions an include is removed')
  it('does not remove definitions if another file is using the include')
  it('scans new projects when they are added')
  it('removes definitions of removed projects')
  it('does not remove the definition when removing project if its referenced by another project in an include')
})
