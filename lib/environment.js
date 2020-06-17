'use babel'
import path from 'path'
import fs from 'fs'

export default class Environment {
  constructor () {
    this.observer = atom.config.observe('atom-agk.agk_compiler_path', (value) => {
      this._compilerPath = value
      this._compilerExists = false
    })
  }

  static get instance () {
    if (!this._instance) {
      this._instance = new Environment()
    }

    return this._instance
  }

  dispose () {
    this.observer.dispose()
  }

  projectPath () {
    return atom.project.getPaths()[0]
  }

  compilerPath () {
    if (!this._compilerExists) {
      if (!fs.existsSync(this._compilerPath)) throw new Error(`Could not find AGK Compiler executable at: "${this._compilerPath}"`)
      this._compilerExists = true
    }

    return this._compilerPath
  }

  compilerDir () {
    return path.dirname(`${this.compilerPath()}`)
  }

  broadcasterPath () {
    return path.join(this.compilerDir(), 'AGKBroadcaster.exe')
  }

  interpreterPath () {
    return path.join(this.compilerDir(), 'interpreters', 'Windows.exe')
  }

  documentationPath (category, command) {
    return path.join(this.compilerDir(), '..', 'Help', 'Reference', category, `${command}.htm`)
  }

  documentationHomePath () {
    return path.join(this.compilerDir(), '..', 'Help', 'home.html')
  }

  relativeToProject (otherPath) {
    return path.relative(this.projectPath(), otherPath)
  }

  fullPath (file) {
    return path.join(this.projectPath(), file)
  }

  join (...args) {
    return path.join(...args)
  }

  isInsideProject (fullpath) {
    return path.normalize(fullpath).startsWith(this.projectPath())
  }

  exists (path) {
    return fs.existsSync(path)
  }
}
