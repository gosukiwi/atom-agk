'use babel'
import path from 'path'
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
    this.scanProject()

    subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      editor.onDidStopChanging(() => {
        let path = editor.getPath()
        if (path === undefined) { // not saved yet
          editor.guid = editor.guid || uid()
          path = `in-memory://${editor.guid}`
        }

        const { file, definitions, includes } = this.scanText(editor.getText(), path)
        this.handleIncludes(file, includes)
        this.setDefinitions(path, definitions)
      })
    }))

    subscriptions.add(this.environment)
  }

  get (prefix, file) {
    return this.definitions.filter((definition) => definition.matches(prefix, file))
  }

  // private

  scanProject () {
    const projectFilesGlob = path.join(this.environment.projectPath(), '**', '*.agc')
    this.scanner.scanPath(projectFilesGlob, ({ file, definitions, includes }) => {
      this.handleIncludes(file, includes)
      this.setDefinitions(file, definitions)
    })
  }

  scanText (text, file) {
    return this.scanner.scanText(text, file)
  }

  // includes is a list of strings taken right from the source code
  handleIncludes (sourcefile, includes) {
    const paths = includes.map((i) => this.environment.join(this.environment.projectPath(), i))
    const currentIncludesInSource = this.includeList.findAllBySource(sourcefile)
    const removed = currentIncludesInSource.filter((i) => !paths.includes(i.file))
    removed.forEach((include) => {
      include.removeSource(sourcefile)

      if (include.includedIn.length === 0) {
        this.includeList.remove(include)
        this.clearDefinitionsFor(include.file)
      }
    })

    paths.forEach((filepath) => {
      if (this.includeList.find(sourcefile, filepath)) return // Already loaded in this file
      if (this.environment.isInsideProject(filepath)) return // Already included by `scanProject`
      if (!filepath.endsWith('.agc')) return // Not a valid name
      if (!this.environment.exists(filepath)) return // Does not exist

      this.includeList.add(sourcefile, filepath)
      if (this.includeList.findByFile(filepath).includedIn.length > 1) return // This was loaded by another file

      this.scanner.scanFile(filepath).then(({ file, definitions, includes }) => {
        this.handleIncludes(file, includes)
        this.setDefinitions(file, definitions)
      })
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
