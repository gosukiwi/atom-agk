'use babel'
import glob from 'glob'
import path from 'path'
import fs from 'fs'
import Environment from '../environment'
import Scanner from './scanners/scanner'
import BUILT_IN_DEFINITIONS from './built-in-definitions'

export default class Definitions {
  constructor ({ subscriptions, env, scanner }) {
    this.env = env || new Environment()
    this.scanner = scanner || new Scanner()
    this.definitionTable = {}
    this.definitions = []

    this.setDefinitions('built-in', BUILT_IN_DEFINITIONS)
    this.scanAllFiles()

    subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      editor.onDidStopChanging(() => {
        this.setDefinitions(editor.getPath(), this.scan(editor.getText()))
      })
    }))

    subscriptions.add(this.env)
  }

  get (prefix) {
    prefix = prefix.toLowerCase()
    return this.definitions.filter((definition) => definition.name.toLowerCase().startsWith(prefix))
  }

  // private

  scanAllFiles () {
    glob(path.join(this.env.projectPath(), '**', '*.agc'), (err, files) => {
      if (err) throw err
      files.forEach((file) => this.scanFile(file))
    })
  }

  scanFile (file) {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) throw err
      this.setDefinitions(file, this.scan(data))
    })
  }

  scan (text) {
    return this.scanner.scan(text)
  }

  setDefinitions (file, definitions) {
    // `glob` returns files with UNIX notation, so let's make sure we use
    // consistent paths and transform Windows paths to UNIX paths.
    this.definitionTable[file.replace(/\\/g, '/')] = definitions
    this.definitions = Object.values(this.definitionTable).flat()
  }
}
