'use babel'

export default class Breakpoint {
  constructor ({ file, line, decoration }) {
    this.file = file
    this.line = line
    this.decoration = decoration
  }
}
