'use babel'
import glob from 'glob'
import path from 'path'
import fs from 'fs'
import Environment from '../environment'
import CompoundScanner from './scanners/compound-scanner'

export default class Scanner {
  constructor (env, scanner) {
    this.env = env || new Environment()
    this.scanner = scanner || new CompoundScanner()
    // TODO: Watch all editors and refresh the file needed when the editor changes
    this.scanAllFiles()
    this.definitionTable = {}
    this.definitions = []
  }

  getDefinitions (prefix) {
    prefix = prefix.toLowerCase()
    return new Promise((resolve) => {
      resolve(this.definitions.filter((definition) => definition.name.toLowerCase().startsWith(prefix)))
    })
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
    this.definitionTable[file] = definitions
    this.definitions = Object.values(this.definitionTable).flat()
  }
}
