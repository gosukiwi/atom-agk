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

  it('does not scan includes if the file is not saved', () => {
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let dummyFileWasScanned = false
    let filepath = null

    const disposable = suggestions.on('was-set', (file) => {
      if (!file.endsWith('dummy.agc')) return
      filepath = file
      dummyFileWasScanned = true
      disposable.dispose()
    })

    waitsForPromise(() => atom.workspace.open('dummy.agc'))
    runs(() => {
      const buffer = atom.workspace.getActiveTextEditor().getBuffer()
      buffer.setText('#include "../project-b/main.agc"')
      buffer.emitDidStopChangingEvent()
    })
    waitsFor(() => dummyFileWasScanned)
    runs(() => {
      expect(suggestions.get('projectbfunc', filepath).find((definition) => definition.name === 'ProjectBFunc')).toBeUndefined()
      subscriptions.dispose()
    })
  })

  it('scans includes once the file is saved', () => {
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let includeWasScanned = false

    const disposable = suggestions.on('was-set', (file) => {
      if (!file.endsWith(fixture('project-b/main.agc'))) return
      includeWasScanned = true
      disposable.dispose()
    })

    waitsForPromise(() => atom.workspace.open('dummy.agc'))
    waitsForPromise(() => {
      const buffer = atom.workspace.getActiveTextEditor().getBuffer()
      buffer.setText('#include "../project-b/main.agc"')
      return buffer.save()
    })
    waitsFor(() => includeWasScanned)
    runs(() => {
      expect(suggestions.get('projectbfunc', fixture('project-b/main.agc')).find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
      removeFile(fixture('project-c/dummy.agc'))
      subscriptions.dispose()
    })
  })

  it('removes the in-memory representation once a file is saved')

  it('scans included files in a project file', () => {
    atom.project.setPaths([fixture('project-a')])
    const { suggestions, subscriptions } = build()
    let wasSet = false

    const disposable = suggestions.on('was-set', (file) => {
      if (!file.endsWith(normalizePath('project-b/main.agc'))) return
      wasSet = true
      subscriptions.dispose()
      disposable.dispose()
    })

    waitsFor(() => wasSet)
    runs(() => {
      expect(suggestions.get('projectb').find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
    })
  })

  it('scans included files in an included file')

  it('removes definitions when a file in a project is removed', () => {
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let dummyFileWasScanned = false
    let dummyFileWasCleared = false
    let filepath = null

    const disposable = suggestions.on('was-set', (file) => {
      if (!file.endsWith('dummy.agc')) return
      filepath = file
      dummyFileWasScanned = true
      disposable.dispose()
    })

    const d = suggestions.on('cleared', (file) => {
      expect(file.endsWith('dummy.agc')).toBe(true)
      dummyFileWasCleared = true
      d.dispose()
    })

    waitsForPromise(() => atom.workspace.open('dummy.agc'))
    waitsForPromise(() => {
      const buffer = atom.workspace.getActiveTextEditor().getBuffer()
      buffer.setText('dummy123 = 1')
      buffer.emitDidStopChangingEvent()
      return buffer.save()
    })
    waitsFor(() => dummyFileWasScanned)
    runs(() => {
      expect(suggestions.get('dummy', filepath).find((definition) => definition.name === 'dummy123')).not.toBeUndefined()
      removeFile(fixture('project-c/dummy.agc'))
    })
    waitsFor(() => dummyFileWasCleared)
    runs(() => {
      expect(suggestions.get('dummy', filepath).find((definition) => definition.name === 'dummy123')).toBeUndefined()
      subscriptions.dispose()
    })
  })

  it("removes include's definitions when it's removed in a sourcefile")
  it("does not remove include's definitions if another sourcefile is using the same include")
  it('scans new projects when they are added')
  it('removes definitions of removed projects')
  it('does not remove the definition when removing project if its referenced by another project in an include')
})
