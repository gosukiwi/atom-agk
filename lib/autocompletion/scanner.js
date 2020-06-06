'use babel'
import glob from 'glob'
import path from 'path'
import fs from 'fs'
import Environment from '../environment'

const FUNCTION_REGEX = /\bfunction\s+([a-zA-Z0-9_#$]+)\s*\(([^\\)]*)\)/ig

class Definition {
  constructor ({ name, args, type }) {
    this.name = name
    this.args = args
    this.type = type
  }

  isFunction () {
    return this.type === 'function'
  }
}

export default class Scanner {
  constructor (env) {
    this.env = env || new Environment()
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
      this.setDefinitions(file, this.scan(data))
    })
  }

  scan (text) {
    return [...text.matchAll(FUNCTION_REGEX)].map((match) => {
      const [, name, argsMatch] = match
      const args = argsMatch.split(',').map((arg) => arg.trim().split(' ')[0])
      return new Definition({ name, args, type: 'function' })
    })
  }

  setDefinitions (file, definitions) {
    this.definitionTable[file] = definitions
    this.definitions = Object.values(this.definitionTable).flat()
  }
}
