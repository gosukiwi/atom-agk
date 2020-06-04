'use babel'

export default class Environment {
  projectPath () {
    return atom.project.getPaths()[0]
  }

  compilerPath () {
    return atom.config.get('atom-agk.agk_compiler_path')
  }
}
