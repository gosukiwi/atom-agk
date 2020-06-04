'use babel'
import Environment from '../environment'

export default class Breakpoint {
  constructor ({ file, line, decoration, environment }) {
    environment = environment || new Environment()
    this.file = environment.relativeToProject(file)
    this.line = line
    this.decoration = decoration
  }
}
