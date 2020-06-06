'use babel'
import glob from 'glob'
import path from 'path'
import fs from 'fs'
import Environment from '../environment'

const FUNCTION_REGEX = /\bfunction\s+([a-zA-Z0-9_]+)\s*\(([^\\)]*)\)/ig

class FunctionDefinition {
  constructor ({ name, args }) {
    this.name = name
    this.args = args
  }
}

export default class Scanner {
  constructor (env) {
    this.env = env || new Environment()
    // TODO: Watch all editors and refresh the file needed when the editor changes
    this.scanAllDefinitions()
    this.definitions = {}
    this.allDefinitions = []
  }

  getDefinitions (prefix) {
    return new Promise((resolve) => {
      resolve(this.allDefinitions
        .filter((definition) => definition.name.startsWith(prefix))
        .map((definition) => definition.name))
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
      const args = argsMatch.split(',').map((arg) => arg.split(' ')[0])
      return new FunctionDefinition({ name, args })
    })
  }

  setDefinitions (file, definitions) {
    this.definitions[file] = definitions
    this.allDefinitions = Object.values(this.definitions).flat()
  }
}
