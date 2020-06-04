'use babel'
import Breakpoint from './breakpoint'

export default class BreakpointManager {
  constructor (subscriptions) {
    this.breakpoints = []
    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:add-breakpoint': () => this.add()
    }))
  }

  add () {
    const editor = atom.workspace.getActiveTextEditor()
    const point = editor.getCursorBufferPosition()
    const line = point.row
    const marker = editor.markBufferPosition([line, 0], { invalidate: 'touch' })
    const decoration = editor.decorateMarker(marker, { type: 'line-number', class: 'agk-debugger-breakpoint' })
    const breakpoint = new Breakpoint({ file: editor.getPath(), line, decoration })
    this.breakpoints.push(breakpoint)
  }

  each (cb) {
    this.breakpoints.forEach(cb)
  }
}
