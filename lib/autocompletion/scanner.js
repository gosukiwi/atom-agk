'use babel'
import glob from 'glob'
import path from 'path'
import fs from 'fs'
import Environment from '../environment'
import FunctionScanner from './scanners/function-scanner'
import TypeScanner from './scanners/type-scanner'

export default class Scanner {
  constructor (env, scanners) {
    this.env = env || new Environment()
    this.scanners = scanners || [
      new FunctionScanner(),
      new TypeScanner()
    ]
    // TODO: Watch all editors and refresh the file needed when the editor changes
    this.scanAllDefinitions()
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

  scanAllDefinitions () {
    glob(path.join(this.env.projectPath(), '**', '*.agc'), (err, files) => {
      if (err) throw err
      files.forEach((file) => this.scanFile(file))
    })
  }

  scanFile (file) {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) throw err
      this.scan(data).then((definitions) => {
        this.setDefinitions(file, definitions)
      })
    })
  }

  scan (text) {
    return new Promise((resolve) => {
      const promises = this.scanners.map((scanner) => scanner.scan(text))
      Promise.all(promises).then((definitions) => {
        resolve(definitions.flat())
      })
    })
  }

  setDefinitions (file, definitions) {
    this.definitionTable[file] = definitions
    this.definitions = Object.values(this.definitionTable).flat()
  }
}
