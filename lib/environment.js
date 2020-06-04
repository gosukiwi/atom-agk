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

  relativeToProject (otherPath) {
    return path.relative(this.projectPath(), otherPath)
  }
}
