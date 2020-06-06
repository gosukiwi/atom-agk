'use babel'

import { Emitter, Disposable } from 'atom'
import TerminalView from './terminal_view'
const AGK_DEBUGGER_URI = 'atom://agk-terminal'

export default class Terminal {
  constructor (subscriptions) {
    this.emitter = new Emitter()
    this.view = new TerminalView()

    subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri === AGK_DEBUGGER_URI) {
        return this
      }
    }))

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:toggle-terminal': () => this.toggle()
    }))

    subscriptions.add(new Disposable(() => {
      atom.workspace.getPaneItems().forEach(item => {
        if (item instanceof Terminal) {
          item.destroy()
        }
      })
    }))
  }

  start () {
    this.view.start()
  }

  stop () {
    this.view.stop()
  }

  pause () {
    this.view.pause()
  }

  focusPrompt () {
    this.view.focusPrompt()
  }

  onCompileButtonClicked (cb) {
    return this.view.on('compile-pressed', cb)
  }

  onRunButtonClicked (cb) {
    return this.view.on('run-pressed', cb)
  }

  onCommandEntered (cb) {
    return this.view.on('command-entered', cb)
  }

  onContinuePressed (cb) {
    return this.view.on('continue-pressed', cb)
  }

  onTogglePressed (cb) {
    return this.view.on('toggle-pressed', cb)
  }

  write (line) {
    this.view.write(line)
  }

  destroy () {
    return this.view.destroy()
  }

  getElement () {
    return this.view.element
  }

  getTitle () {
    return 'AGK Terminal'
  }

  getURI () {
    return AGK_DEBUGGER_URI
  }

  getDefaultLocation () {
    return 'bottom'
  }

  toggle () {
    atom.workspace.toggle(AGK_DEBUGGER_URI)
  }

  open () {
    atom.workspace.open(AGK_DEBUGGER_URI)
  }
}
