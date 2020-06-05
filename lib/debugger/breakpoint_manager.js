'use babel'
import { Disposable } from 'atom'
import Breakpoint from './breakpoint'
import Environment from '../environment'

export default class BreakpointManager {
  constructor (subscriptions, environment) {
    this.environment = environment || new Environment()
    this.breakpoints = []

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:toggle-breakpoint': () => this.toggle()
    }))

    subscriptions.add(new Disposable(() => {
      this.each((breakpoint) => this.delete(breakpoint))
    }))
  }

  toggle () {
    const editor = atom.workspace.getActiveTextEditor()
    const fullpath = this.environment.relativeToProject(editor.getPath())
    const point = editor.getCursorBufferPosition()
    const line = point.row
    const breakpoint = this.find(fullpath, line)
    if (breakpoint) {
      this.delete(breakpoint)
    } else {
      this.add(editor, fullpath, line)
    }
  }

  add (editor, file, line) {
    const marker = editor.markBufferPosition([line, 0], { invalidate: 'touch' })
    const decoration = editor.decorateMarker(marker, { type: 'line-number', class: 'agk-debugger-breakpoint' })
    const breakpoint = new Breakpoint({ file, line, decoration })
    this.breakpoints.push(breakpoint)

    marker.onDidDestroy(() => {
      this.delete(breakpoint)
    })
  }

  delete (breakpoint) {
    breakpoint.decoration.destroy()
    this.breakpoints = this.breakpoints.filter((b) => b !== breakpoint)
  }

  find (file, line) {
    return this.breakpoints.find((breakpoint) => breakpoint.file === file && breakpoint.line === line)
  }

  each (cb) {
    this.breakpoints.forEach(cb)
  }
}
