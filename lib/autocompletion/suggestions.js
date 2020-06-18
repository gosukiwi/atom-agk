'use babel'
import path from 'path'
import glob from 'glob'
import { Emitter, Directory, File } from 'atom'
import Environment from '../environment'
import Scanner from './scanner'
import IncludeList from './includes/include-list'
import BUILT_IN_DEFINITIONS from './built-in-definitions'

// v4 uid from https://stackoverflow.com/a/2117523/1015566
function uid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export default class Suggestions {
  constructor ({ subscriptions, environment, scanner }) {
    this.scanner = scanner || new Scanner()
    this.environment = environment || Environment.instance
    this.definitionTable = {}
    this.definitions = []
    this.includeList = new IncludeList()
    this.emitter = new Emitter()

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
        glob(path.join(directory, '**', '*.agc'), (err, files) => {
          if (err) throw err
          files.forEach((file) => {
            this.clearSuggestionsFor(path.normalize(file))
          })
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
      editor.guid = editor.guid || uid()
      filepath = `in-memory://${editor.guid}`
    }

    const basedir = atom.project.getDirectories().find((d) => d.contains(filepath))
    const { definitions, includes } = this.scanText(basedir, editor.getText(), filepath)
    this.setDefinitions(filepath, definitions)
    if (basedir !== undefined) {
      this.handleIncludes({ directory: basedir, file: filepath, includes })
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
      this.handleIncludes({ directory, file, includes })
      this.setDefinitions(file, definitions)
    })
  }

  scanText (directory, text, file) {
    return this.scanner.scanText(directory, text, file)
  }

  // includes is a list of strings taken right from the source code
  handleIncludes ({ directory, sourcefile, includes }) {
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

      this.scanner.scanFile(directory, new File(filepath)).then(({ directory, file, definitions, includes }) => {
        // TODO: Recursive includes of files outside current projects
        // this.handleIncludes({ directory, sourcefile: file, includes })
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
    this.emitter.emit('was-set', file, definitions)
  }

  clearDefinitionsFor (file) {
    delete this.definitionTable[file]
    this.definitions = Object.values(this.definitionTable).flat()
    this.emitter.emit('cleared', file)
  }
}
