'use babel'
import { Disposable } from 'atom'
import BreakpointManager from './breakpoint_manager'
import DebuggerView from './debugger_view'
import Runner from './runner'

export default class Debugger {
  constructor (subscriptions) {
    this.debuggerView = new DebuggerView()
    const breakpoints = new BreakpointManager(subscriptions)
    this.runner = new Runner(breakpoints)
    this.runner.onOutput((output) => this.debuggerView.writeLine(output))

    subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri === DebuggerView.agkDebuggerURI) {
        return this.debuggerView
      }
    }))

    subscriptions.add(new Disposable(() => {
      this.debuggerView = null
      atom.workspace.getPaneItems().forEach(item => {
        if (item instanceof DebuggerView) {
          item.destroy()
        }
      })
    }))

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:debug': () => this.debug(),
      'atom-agk:toggle-debugger': () => this.toggleDebugger()
    }))
  }

  debug () {
    this.runner.start()
    this.debuggerView.onCommandEntered((command) => {
      this.debuggerView.writeLine(`> ${command}`)
      this.runner.watch(command)
    })

    this.debuggerView.onContinuePressed(() => {
      this.debuggerView.writeLine('Continuing...')
      this.runner.continue()
    })

    // open debugger window
    this.openDebugger()
  }

  toggleDebugger () {
    atom.workspace.toggle(DebuggerView.agkDebuggerURI)
  }

  openDebugger () {
    atom.workspace.open(DebuggerView.agkDebuggerURI)
  }
}
