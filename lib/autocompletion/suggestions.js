'use babel'
import path from 'path'
import glob from 'glob'
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

    this.setDefinitions('built-in', BUILT_IN_DEFINITIONS)
    atom.project.getPaths().forEach((directory) => {
      this.scanPath(directory)
    })

    subscriptions.add(atom.project.onDidChangeFiles((events) => {
      events.forEach((event) => {
        if (event.action === 'deleted') {
          this.clearSuggestionsFor(event.path)
        }
      })
    }))

    let projectPaths = atom.project.getPaths()
    subscriptions.add(atom.project.onDidChangePaths((paths) => {
      const added = paths.filter((p) => !projectPaths.includes(p))
      const removed = projectPaths.filter((p) => !paths.includes(p))
      projectPaths = paths

      added.forEach((directory) => this.scanPath(directory))
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
      editor.onDidStopChanging(() => {
        let filepath = editor.getPath()
        if (filepath === undefined) { // not saved yet
          editor.guid = editor.guid || uid()
          filepath = `in-memory://${editor.guid}`
        }

        const { definitions, includes } = this.scanText(editor.getText(), filepath)
        this.handleIncludes(filepath, includes)
        this.setDefinitions(filepath, definitions)
      })
    }))

    subscriptions.add(this.environment)
  }

  get (prefix, file) {
    return this.definitions.filter((definition) => definition.matches(prefix, file))
  }

  // private

  scanPath (directory) {
    const glob = path.join(directory, '**', '*.agc')
    this.scanner.scanPath(glob, ({ file, definitions, includes }) => {
      this.handleIncludes(file, includes)
      this.setDefinitions(file, definitions)
    })
  }

  scanText (text, file) {
    return this.scanner.scanText(text, file)
  }

  // includes is a list of strings taken right from the source code
  handleIncludes (sourcefile, includes) {
    let basepath = atom.project.getDirectories().find((directory) => directory.contains(sourcefile))
    basepath = basepath ? basepath.getPath() : sourcefile
    const paths = includes.map((inc) => path.join(basepath, inc))
    const currentIncludes = this.includeList.findAllBySource(sourcefile)
    const removedIncludes = currentIncludes.filter((i) => !paths.includes(i.file))
    removedIncludes.forEach((include) => {
      include.removeSource(sourcefile)

      if (include.sources.length === 0) {
        this.includeList.remove(include)
        this.clearDefinitionsFor(include.file)
      }
    })

    paths.forEach((filepath) => {
      if (this.includeList.find(sourcefile, filepath)) return // Already loaded in this file
      if (atom.project.contains(filepath)) return // Already included by `scanPath`
      if (!filepath.endsWith('.agc')) return // Not a valid name
      if (!this.environment.exists(filepath)) return // Does not exist

      this.includeList.add(sourcefile, filepath)
      if (this.includeList.findByFile(filepath).sources.length > 1) return // This was loaded by another file

      this.scanner.scanFile(filepath).then(({ file, definitions, includes }) => {
        this.handleIncludes(file, includes)
        this.setDefinitions(file, definitions)
      })
    })
  }

  clearSuggestionsFor (file) {
    this.clearIncludesFor(file)
    this.clearDefinitionsFor(file)
  }

  clearIncludesFor (file) {
    this.includeList.findAllBySource(file).forEach((include) => {
      include.removeSource(file)

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
  }

  clearDefinitionsFor (file) {
    delete this.definitionTable[file]
    this.definitions = Object.values(this.definitionTable).flat()
  }
}
