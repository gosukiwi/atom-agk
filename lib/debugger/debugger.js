'use babel'
import { Disposable } from 'atom'
import DebuggerView from './debugger_view'
import BreakpointManager from './breakpoint_manager'
import Runner from './runner'
const REGEX = /Break:([^.]+\.agc):(\d+)/

export default class Debugger {
  constructor ({ subscriptions, compiler, runner, view }) {
    this.compiler = compiler
    this.view = view || new DebuggerView({ started: false, paused: false })
    this.runner = runner || new Runner({ breakpoints: new BreakpointManager(subscriptions) })

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

    this.runner.onOutput((output) => {
      this.view.writeLine(output)
      this.highlightBreakpointIfNeeded(output)
    })

    this.runner.onStarted(() => {
      this.view.update({ started: true, paused: false })
    })

    this.runner.onStopped(() => {
      this.view.update({ started: false, paused: false })
    })

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
    return this.compiler.compile().then(() => {
      this.runner.start()
      this.openDebuggerWindow()
    })
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
      this.view.update({ paused: true })
      setTimeout(() => this.view.focusPrompt(), 500) // hacky because `view.update` is async
    })
  }
}
