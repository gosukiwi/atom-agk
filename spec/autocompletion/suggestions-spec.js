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

  it('does not scan includes in an in-memory file', () => {
    atom.project.setPaths([fixture('non-existant-dir')])
    const { suggestions, subscriptions } = build()
    let editorWasScanned = false
    const editor = atom.workspace.buildTextEditor()
    spyOn(suggestions, 'handleIncludes')

    suggestions.on('was-set', (file) => {
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

    suggestions.on('was-set', (file) => {
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

    suggestions.on('was-set', (file) => {
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

    suggestions.on('was-set', (file) => {
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
      removeFile(fixture('project-c/dummy.agc'))
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

    const disposable = suggestions.on('was-set', (file) => {
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
      removeFile(inDiskPath)
      disposable.dispose()
      subscriptions.dispose()
    })
  })

  it('scans included files in a project file', () => {
    atom.project.setPaths([fixture('project-a')])
    const { suggestions, subscriptions } = build()
    let wasSet = false

    const disposable = suggestions.on('was-set', (file) => {
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

    const disposable = suggestions.on('was-set', (file) => {
      if (file !== dummyfile) return
      dummyFileWasScanned = true
      disposable.dispose()
    })

    const d = suggestions.on('cleared', (file) => {
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
      removeFile(dummyfile)
    })
    waitsFor(() => dummyFileWasCleared)
    runs(() => {
      expect(suggestions.get('dummy', dummyfile).find((definition) => definition.name === 'dummy123')).toBeUndefined()
      subscriptions.dispose()
    })
  })

  it("removes include's definitions when it's removed in a sourcefile", () => {
    // given
    atom.project.setPaths([fixture('project-c')])
    const { suggestions, subscriptions } = build()
    let includeWasScanned = false
    let includeWasCleared = false

    suggestions.on('was-set', (file) => {
      if (file === fixture('project-b/main.agc')) includeWasScanned = true
    })

    suggestions.on('cleared', (file) => {
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
      // when
      removeFile(fixture('project-c/dummy.agc'))
    })
    waitsFor(() => includeWasCleared)
    // then
    runs(() => {
      expect(suggestions.get('projectbfunc').find((definition) => definition.name === 'ProjectBFunc')).toBeUndefined()
      subscriptions.dispose()
    })
  })

  it("does not remove include's definitions if another sourcefile is using the same include", () => {
    // given
    atom.project.setPaths([fixture('project-a')]) // project-a/main.agc includes project-b/main.agc
    const { suggestions, subscriptions } = build()

    waitsForPromise(() => atom.workspace.open('dummy.agc'))
    waitsForPromise(() => {
      const buffer = atom.workspace.getActiveTextEditor().getBuffer()
      buffer.setText('#include "../project-b/main.agc"')
      return buffer.save()
    })
    runs(() => {
      removeFile(fixture('project-a/dummy.agc'))
      // Node's `fs.unlink` doesn't trigger events consistently, so just trigger it manually for specs purposes
      atom.project.emitter.emit('did-change-files', [{ action: 'deleted', path: fixture('project-a/dummy.agc') }])
      expect(suggestions.get('projectbfunc').find((definition) => definition.name === 'ProjectBFunc')).not.toBeUndefined()
      expect(suggestions.includeList.includes[0].sources).toEqual([fixture('project-a/main.agc')])
      subscriptions.dispose()
    })
  })

  it('scans new projects when they are added')
  it('removes definitions of removed projects')
  it('does not remove the definition when removing project if its referenced by another project in an include')
  it('scans included files in an included file')
})
