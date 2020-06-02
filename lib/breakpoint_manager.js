'use babel';

class Breakpoint {
  constructor(filename, line, decoration) {
    this.filename = filename;
    this.line = line;
    this.decoration = decoration;
  }
}

export default class BreakpointManager {
  constructor(subscriptions) {
    this.breakpoints = []
    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:add-breakpoint': () => this.add()
    }))
  }

  add() {
    const editor = atom.workspace.getActiveTextEditor()
    const point = editor.getCursorBufferPosition()
    const line = point.row
    const marker = editor.markBufferPosition([line, 0], { invalidate: 'touch' })
    const decoration = editor.decorateMarker(marker, { type: 'line-number', class: 'agk-debugger-breakpoint' })
    const breakpoint = new Breakpoint(editor.getPath(), line, decoration)
    this.breakpoints.push(breakpoint)
  }
}
