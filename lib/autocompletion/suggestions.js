'use babel'
import path from 'path'
import { Emitter, Directory, File } from 'atom'
import Environment from '../environment'
import Walker from '../walker'
import Scanner from './scanner'
import IncludeList from './includes/include-list'
import BUILT_IN_DEFINITIONS from './built-in-definitions'

// This class exposes a `get` method which is called by the autocomplete-plus
// package to show options for autocomplete.
// It is in charge of scanning files and keeping definitions in sync.
// The way it works is:
//
//  * Scan all files in all active projects
//  * Save all includes, and if those files are outside a project, scan those
//    files for definitions
//  * If an included files includes another one, it gets scanned recursively,
//    but it only works if it's inside a project
//
// The way AGK works with includes is that all includes are relative to the
// project's main file. So for example:
//
//    // ./foo/bar.agc
//    # include "baz.agc" // this searches for `./bar.agc` and not for `./foo/baz.agc`
//
// Because of that, all includes in files outside of a project use the project
// as their relative location. That might not be intuitive.
export default class Suggestions {
  constructor ({ subscriptions, environment, scanner }) {
    this.scanner = scanner || new Scanner()
    this.environment = environment || Environment.instance
    this.definitionTable = {}
    this.definitions = []
    this.includeList = new IncludeList()
    this.emitter = new Emitter()
    this.walker = new Walker()

    this.setDefinitions('built-in', BUILT_IN_DEFINITIONS)
    atom.project.getDirectories().forEach((directory) => {
      this.scanDirectory(directory)
    })

    subscriptions.add(atom.project.onDidChangeFiles((events) => {
      events.forEach((event) => {
        if (event.action === 'deleted') {
          this.clearSuggestionsFor(event.path)
        }
      })
    }))

    let oldPaths = atom.project.getPaths()
    subscriptions.add(atom.project.onDidChangePaths((paths) => {
      const added = paths.filter((p) => !oldPaths.includes(p))
      const removed = oldPaths.filter((p) => !paths.includes(p))
      oldPaths = paths

      added.forEach((directory) => this.scanDirectory(new Directory(directory)))
      removed.forEach((directory) => {
        this.walker.walk(new Directory(directory), (file) => {
          if (file.getBaseName().endsWith('.agc')) this.clearSuggestionsFor(file.getPath())
        })
      })
    }))

    subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      subscriptions.add(editor.onDidStopChanging(() => this.refreshDefinitions(editor)))
      subscriptions.add(editor.onDidSave(() => this.refreshDefinitions(editor)))
    }))

    subscriptions.add(this.environment)
  }

  refreshDefinitions (editor) {
    let filepath = editor.getPath()
    if (filepath === undefined) { // not saved yet
      filepath = `in-memory://editor-${editor.id}`
    } else if (this.definitionTable[`in-memory://editor-${editor.id}`]) {
      // if this used to be in memory but now was saved, delete it
      this.clearDefinitionsFor(`in-memory://editor-${editor.id}`)
    }

    const basedir = atom.project.getDirectories().find((d) => d.contains(filepath))
    const { definitions, includes } = this.scanText(editor.getText(), filepath)
    this.setDefinitions(filepath, definitions)
    if (basedir !== undefined) { // it cannot be in memory or outside of a project
      this.handleIncludes({ directory: basedir, sourcefile: filepath, includes })
    }
  }

  get (prefix, file) {
    return this.definitions.filter((definition) => definition.matches(prefix, file))
  }

  on (name, cb) {
    return this.emitter.on(name, cb)
  }

  // private

  scanDirectory (directory) {
    this.scanner.scanDirectory(directory, ({ file, definitions, includes }) => {
      this.handleIncludes({ directory, sourcefile: file, includes })
      this.setDefinitions(file, definitions)
    })
  }

  scanText (text, file) {
    return this.scanner.scanText(text, file)
  }

  // includes is a list of strings taken right from the source code
  handleIncludes ({ directory, sourcefile, includes }) {
    if (sourcefile === undefined) throw new Error('Sourcefile cannot be undefined')

    const basepath = directory.getPath()
    const paths = includes.map((inc) => path.join(basepath, inc))
    const currentIncludes = this.includeList.findAllBySource(sourcefile)
    const removedIncludes = currentIncludes.filter((i) => !paths.includes(i.file))
    removedIncludes.forEach((include) => {
      include.removeSource(sourcefile)

      if (include.sources.length === 0) {
        this.includeList.remove(include)

        if (!atom.project.contains(include.file)) {
          this.clearDefinitionsFor(include.file)
        }
      }
    })

    paths.forEach((filepath) => {
      if (this.includeList.find(sourcefile, filepath)) return // Already loaded in this file
      if (atom.project.contains(filepath)) return // Already included by `scanDirectory`
      if (!filepath.endsWith('.agc')) return // Not a valid name
      if (!this.environment.exists(filepath)) return // Does not exist

      this.includeList.add(sourcefile, filepath)
      if (this.includeList.findByFile(filepath).sources.length > 1) return // This was loaded by another file

      this.scanner.scanFile(new File(filepath)).then(({ file, definitions, includes }) => {
        this.handleIncludes({ directory, sourcefile: file, includes })
        this.setDefinitions(file, definitions)
      })
    })
  }

  clearSuggestionsFor (file) {
    this.clearIncludesFor(file)
    this.clearDefinitionsFor(file)
  }

  clearIncludesFor (sourcefile) {
    this.includeList.findAllBySource(sourcefile).forEach((include) => {
      include.removeSource(sourcefile)

      if (include.sources.length === 0) {
        this.includeList.remove(include)

        if (!atom.project.contains(include.file)) {
          this.clearDefinitionsFor(include.file)
        }
      }
    })
  }

  // Here `file` is used mostly as a unique identifier. We don't open the file
  // or  do anything to it, but we want to group definitions by file. When the
  // file is not yet saved, this method can take any string argument to group
  // definitions as long as it's unique.
  setDefinitions (file, definitions) {
    this.definitionTable[file] = definitions
    this.definitions = Object.values(this.definitionTable).flat()
    this.emitter.emit('definition-set', { file, definitions })
  }

  clearDefinitionsFor (file) {
    delete this.definitionTable[file]
    this.definitions = Object.values(this.definitionTable).flat()
    this.emitter.emit('definition-cleared', file)
  }
}
