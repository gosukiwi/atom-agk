'use babel'
import { CompositeDisposable } from 'atom'
import { fixture, unlink } from '../spec-helper'
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

    const disposable = suggestions.on('definition-set', (file) => {
      expect(file).toBe(fixture('project-a/main.agc'))
      expect(suggestions.get('projectafunc').find((definition) => definition.name === 'ProjectAFunc')).not.toBeUndefined()
      expect(suggestions.get('projectcfunc').find((definition) => definition.name === 'ProjectCFunc')).toBeUndefined()
      subscriptions.dispose()
      disposable.dispose()
    })
  })

  it('does not scan includes in an in-memory file', () => {
    atom.project.setPaths([fixture('non-existant-dir')])
    const { suggestions, subscriptions } = build()
    let editorWasScanned = false
    const editor = atom.workspace.buildTextEditor()
    spyOn(suggestions, 'handleIncludes')

    suggestions.on('definition-set', (file) => {
      if (file === `in-memory://editor-${editor.id}`) editorWasScanned = true
    })

    waitsForPromise(() => atom.workspace.open(editor))
    runs(() => {
      const buffer = editor.getBuffer()
      buffer.setText(`
        #include "../foo.agc"
        bar = 123
      `)
      buffer.emitDidStopChangingEvent()
    })
    waitsFor(() => editorWasScanned)
    runs(() => {
      expect(suggestions.get('bar', `in-memory://editor-${editor.id}`).find((definition) => definition.name === 'bar')).not.toBeUndefined()
      expect(suggestions.handleIncludes).not.toHaveBeenCalled()
      subscriptions.dispose()
    })
  })

  it('does not scan includes if the file is not in a project', () => {
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let dummyFileWasScanned = false
    spyOn(suggestions, 'handleIncludes')

    suggestions.on('definition-set', (file) => {
      if (file === fixture('dummy.agc')) dummyFileWasScanned = true
    })

    waitsForPromise(() => atom.workspace.open(fixture('dummy.agc')))
    runs(() => {
      const buffer = atom.workspace.getActiveTextEditor().getBuffer()
      buffer.setText('#include "../project-b/main.agc"')
      buffer.emitDidStopChangingEvent()
    })
    waitsFor(() => dummyFileWasScanned)
    runs(() => {
      expect(suggestions.get('projectbfunc').find((definition) => definition.name === 'ProjectBFunc')).toBeUndefined()
      expect(suggestions.handleIncludes).not.toHaveBeenCalled()
      subscriptions.dispose()
    })
  })

  it('scans includes after didStopChanging if the file is in a project', () => {
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let includeWasScanned = false

    suggestions.on('definition-set', (file) => {
      if (file === fixture('project-b/main.agc')) includeWasScanned = true
    })

    waitsForPromise(() => atom.workspace.open('some-file.agc'))
    runs(() => {
      const buffer = atom.workspace.getActiveTextEditor().getBuffer()
      buffer.setText('#include "../project-b/main.agc"')
      buffer.emitDidStopChangingEvent()
    })
    waitsFor(() => includeWasScanned)
    runs(() => {
      expect(suggestions.get('projectbfunc').find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
      subscriptions.dispose()
    })
  })

  it('scans includes after save if the file is in a project', () => {
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let includeWasScanned = false

    suggestions.on('definition-set', (file) => {
      if (file === fixture('project-b/main.agc')) includeWasScanned = true
    })

    waitsForPromise(() => atom.workspace.open('dummy.agc'))
    waitsForPromise(() => {
      const buffer = atom.workspace.getActiveTextEditor().getBuffer()
      buffer.setText('#include "../project-b/main.agc"')
      return buffer.save()
    })
    waitsFor(() => includeWasScanned)
    runs(() => {
      expect(suggestions.get('projectbfunc').find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
      unlink(fixture('project-c/dummy.agc'))
      subscriptions.dispose()
    })
  })

  it('removes the in-memory representation once a file is saved', () => {
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let buffer = null
    let wasScanned = false
    let savedFileWasScanned = false
    const editor = atom.workspace.buildTextEditor()
    const inMemoryPath = `in-memory://editor-${editor.id}`
    const inDiskPath = fixture('somefile.agc')

    const disposable = suggestions.on('definition-set', (file) => {
      if (file === inMemoryPath) wasScanned = true
      if (file === inDiskPath) savedFileWasScanned = true
    })

    waitsForPromise(() => atom.workspace.open(editor))
    runs(() => {
      buffer = editor.getBuffer()
      buffer.setText('foo = 123')
      buffer.emitDidStopChangingEvent()
    })
    waitsFor(() => wasScanned)
    runs(() => {
      expect(suggestions.definitionTable[inMemoryPath]).not.toBeUndefined()
    })
    waitsForPromise(() => buffer.saveAs(inDiskPath))
    waitsFor(() => savedFileWasScanned)
    runs(() => {
      expect(suggestions.definitionTable[inDiskPath]).not.toBeUndefined()
      expect(suggestions.definitionTable[inMemoryPath]).toBeUndefined()
      unlink(inDiskPath)
      disposable.dispose()
      subscriptions.dispose()
    })
  })

  it('scans included files in a project file', () => {
    atom.project.setPaths([fixture('project-a')])
    const { suggestions, subscriptions } = build()
    let wasSet = false

    const disposable = suggestions.on('definition-set', (file) => {
      if (file !== fixture('project-b/main.agc')) return
      wasSet = true
      subscriptions.dispose()
      disposable.dispose()
    })

    waitsFor(() => wasSet)
    runs(() => {
      expect(suggestions.get('projectb').find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
    })
  })

  it('removes definitions when a file in a project is removed', () => {
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let dummyFileWasScanned = false
    let dummyFileWasCleared = false
    const dummyfile = fixture('project-c/dummy.agc')

    const disposable = suggestions.on('definition-set', (file) => {
      if (file !== dummyfile) return
      dummyFileWasScanned = true
      disposable.dispose()
    })

    const d = suggestions.on('definition-cleared', (file) => {
      expect(file).toBe(dummyfile)
      dummyFileWasCleared = true
      d.dispose()
    })

    waitsForPromise(() => atom.workspace.open(dummyfile))
    waitsForPromise(() => {
      const buffer = atom.workspace.getActiveTextEditor().getBuffer()
      buffer.setText('dummy123 = 1')
      buffer.emitDidStopChangingEvent()
      return buffer.save()
    })
    waitsFor(() => dummyFileWasScanned)
    runs(() => {
      expect(suggestions.get('dummy', dummyfile).find((definition) => definition.name === 'dummy123')).not.toBeUndefined()
      unlink(dummyfile)
    })
    waitsFor(() => dummyFileWasCleared)
    runs(() => {
      expect(suggestions.get('dummy', dummyfile).find((definition) => definition.name === 'dummy123')).toBeUndefined()
      subscriptions.dispose()
    })
  })

  it("removes include's definitions when it's removed in a sourcefile", () => { // GIVEN
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let includeWasScanned = false
    let includeWasCleared = false

    suggestions.on('definition-set', (file) => {
      if (file === fixture('project-b/main.agc')) includeWasScanned = true
    })

    suggestions.on('definition-cleared', (file) => {
      if (file === fixture('project-b/main.agc')) includeWasCleared = true
    })

    waitsForPromise(() => atom.workspace.open('dummy.agc'))
    waitsForPromise(() => {
      const buffer = atom.workspace.getActiveTextEditor().getBuffer()
      buffer.setText('#include "../project-b/main.agc"')
      return buffer.save()
    })
    waitsFor(() => includeWasScanned)
    runs(() => {
      expect(suggestions.get('projectbfunc').find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
      // WHEN
      unlink(fixture('project-c/dummy.agc'))
    })
    waitsFor(() => includeWasCleared)
    runs(() => { // THEN
      expect(suggestions.get('projectbfunc').find((definition) => definition.name === 'ProjectBFunc')).toBeUndefined()
      subscriptions.dispose()
    })
  })

  it("does not remove include's definitions if another sourcefile is using the same include", () => { // GIVEN
    atom.project.setPaths([fixture('project-a')]) // project-a/main.agc includes project-b/main.agc
    const { suggestions, subscriptions } = build()
    let dummyFileWasScanned = false
    let dummyFileWasCleared = false
    let includeWasScanned = false

    suggestions.on('definition-set', (file) => {
      if (file === fixture('project-a/dummy.agc')) dummyFileWasScanned = true
      if (file === fixture('project-b/main.agc')) includeWasScanned = true
    })

    suggestions.on('definition-cleared', (file) => {
      if (file === fixture('project-a/dummy.agc')) dummyFileWasCleared = true
    })

    waitsFor(() => includeWasScanned)
    waitsForPromise(() => atom.workspace.open('dummy.agc'))
    waitsForPromise(() => {
      const buffer = atom.workspace.getActiveTextEditor().getBuffer()
      buffer.setText('#include "../project-b/main.agc"')
      return buffer.save()
    })
    waitsFor(() => dummyFileWasScanned)
    runs(() => { // WHEN
      unlink(fixture('project-a/dummy.agc'))
    })
    waitsFor(() => dummyFileWasCleared)
    runs(() => { // THEN
      expect(suggestions.get('projectbfunc').find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
      expect(suggestions.includeList.includes[0].sources).toEqual([fixture('project-a/main.agc')])
      subscriptions.dispose()
    })
  })

  it('scans new projects when they are added', () => {
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let projectBMainFileWasScanned = false

    suggestions.on('definition-set', (file) => {
      if (file === fixture('project-b/main.agc')) projectBMainFileWasScanned = true
    })

    atom.project.addPath(fixture('project-b'))
    waitsFor(() => projectBMainFileWasScanned)
    runs(() => {
      expect(suggestions.get('projectbfunc').find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
      subscriptions.dispose()
    })
  })

  it('removes definitions of removed projects', () => {
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let mainFileWasScanned = false
    let mainFileWasCleared = false

    suggestions.on('definition-set', (file) => {
      if (file === fixture('project-c/main.agc')) mainFileWasScanned = true
    })

    suggestions.on('definition-cleared', (file) => {
      if (file === fixture('project-c/main.agc')) mainFileWasCleared = true
    })

    waitsFor(() => mainFileWasScanned)
    runs(() => {
      expect(suggestions.get('projectcfunc').find((definition) => definition.name === 'ProjectCFunc')).not.toBeUndefined()
      atom.project.setPaths([])
    })
    waitsFor(() => mainFileWasCleared)
    runs(() => {
      expect(suggestions.get('projectcfunc').find((definition) => definition.name === 'ProjectCFunc')).toBeUndefined()
      subscriptions.dispose()
    })
  })

  it('does not remove the definition when removing project if its referenced by another project in an include', () => {
    atom.project.setPaths([fixture('project-a'), fixture('project-d')]) // both include `./project-b/main.agc`
    const { suggestions, subscriptions } = build()
    let projectBMainFileWasScanned = false
    let projectDWasCleared = false

    suggestions.on('definition-set', (file) => {
      if (file === fixture('project-b/main.agc')) projectBMainFileWasScanned = true
    })

    suggestions.on('definition-cleared', (file) => {
      if (file === fixture('project-d/main.agc')) projectDWasCleared = true
    })

    waitsFor(() => projectBMainFileWasScanned)
    runs(() => {
      expect(suggestions.get('projectbfunc').find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
      atom.project.setPaths([fixture('project-a')])
    })
    waitsFor(() => projectDWasCleared)
    runs(() => {
      expect(suggestions.get('projectbfunc').find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
      subscriptions.dispose()
    })
  })

  it('scans included files outside a project', () => {
    atom.project.setPaths([fixture('project-d')])
    const { suggestions, subscriptions } = build()
    let demoFileWasScanned = false

    suggestions.on('definition-set', (file) => {
      if (file === fixture('demo.agc')) demoFileWasScanned = true
    })

    waitsFor(() => demoFileWasScanned)
    runs(() => {
      expect(suggestions.get('foo').find((definition) => definition.name === 'Foo')).not.toBeUndefined()
      subscriptions.dispose()
    })
  })

  it('scans included files in an included file')
})
