'use babel'
import { Disposable } from 'atom'
import DebuggerView from './debugger_view'
import BreakpointManager from './breakpoint_manager'
import Runner from './runner'
const REGEX = /Break:([^.]+\.agc):(\d+)/

export default class Debugger {
  constructor ({ subscriptions, runner, view }) {
    this.view = view || new DebuggerView({ started: false })
    this.runner = runner || new Runner({ breakpoints: new BreakpointManager(subscriptions) })

    this.runner.onOutput((output) => {
      this.view.writeLine(output)
      this.highlightBreakpointIfNeeded(output)
    })

    this.runner.onStarted(() => {
      this.view.setState({ started: true })
    })

    this.runner.onStopped(() => {
      this.view.setState({ started: false })
    })

    subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri === DebuggerView.agkDebuggerURI) {
        return this.view
      }
    }))

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:debug': () => this.debug(),
      'atom-agk:toggle-debugger': () => this.toggleDebuggerWindow()
    }))

    subscriptions.add(new Disposable(() => {
      this.runner.stop()
      atom.workspace.getPaneItems().forEach(item => {
        if (item instanceof DebuggerView) {
          item.destroy()
        }
      })
    }))

    this.view.onCommandEntered((command) => {
      this.runner.watch(command)
    })

    this.view.onContinuePressed(() => {
      this.runner.continue()
    })

    this.view.onTogglePressed(() => {
      this.runner.toggle()
    })
  }

  debug () {
    this.runner.start()
    this.openDebuggerWindow()
  }

  toggleDebuggerWindow () {
    atom.workspace.toggle(DebuggerView.agkDebuggerURI)
  }

  openDebuggerWindow () {
    atom.workspace.open(DebuggerView.agkDebuggerURI)
  }

  highlightBreakpointIfNeeded (output) {
    const result = output.trim().match(REGEX)
    if (result === null) return

    const [, file, line] = result
    atom.workspace.open(file).then((editor) => {
      atom.focus()
      editor.setCursorBufferPosition([line - 1, 0])
    })
  }
}
