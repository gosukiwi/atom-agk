'use babel'
import path from 'path'

export default class Environment {
  projectPath () {
    return atom.project.getPaths()[0]
  }

  compilerPath () {
    return atom.config.get('atom-agk.agk_compiler_path')
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
}
