'use babel'
import path from 'path'
import Environment from '../environment'
import Scanner from './scanner'
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
    this.includedFiles = []

    this.setDefinitions('built-in', BUILT_IN_DEFINITIONS)
    this.scanProject()

    subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      editor.onDidStopChanging(() => {
        let path = editor.getPath()
        if (path === undefined) { // not saved yet
          editor.guid = editor.guid || uid()
          path = `in-memory://${editor.guid}`
        }

        const { definitions, includes } = this.scanText(editor.getText(), path)
        this.scanIncludedFiles(includes)
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
      this.scanIncludedFiles(includes)
      this.setDefinitions(file, definitions)
    })
  }

  scanText (text, file) {
    return this.scanner.scanText(text, file)
  }

  scanIncludedFiles (files) {
    files.forEach((file) => {
      const filepath = this.environment.join(this.environment.projectPath(), file)

      if (this.includedFiles.includes(filepath)) return
      if (this.environment.isInsideProject(filepath)) return
      if (!this.environment.exists(filepath)) return

      this.includedFiles.push(filepath)
      this.scanner.scanFile(filepath).then(({ file, definitions, includes }) => {
        this.scanIncludedFiles(includes)
        this.setDefinitions(file, definitions)
      })
    })
  }

  // Here `file` is used mostly as a unique identifier. We don't open the file
  // or  do anything to it, but we want to group definitions by file. When the
  // file is not yet saved, this method can take any string argument to group
  // definitions as long as it's unique.
  setDefinitions (file, definitions) {
    // The scanner returns paths with UNIX notation (because of `npm-glob`), but
    // the Atom API returns paths with native notation, so let's make sure we
    // use consistent paths and transform Windows paths to UNIX paths.
    this.definitionTable[file.replace(/\\/g, '/')] = definitions
    this.definitions = Object.values(this.definitionTable).flat()
  }
}
