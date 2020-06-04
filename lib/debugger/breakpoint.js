'use babel'
import Environment from '../environment'

export default class Breakpoint {
  constructor (filepath, line, decoration, environment) {
    environment = environment || new Environment()
    this.file = environment.relativeToProject(filepath)
    this.line = line
    this.decoration = decoration
  }
}
