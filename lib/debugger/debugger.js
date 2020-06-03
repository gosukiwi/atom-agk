'use babel'
import { Disposable } from 'atom'
import DebuggerView from './debugger_view'

export default class Debugger {
  constructor (subscriptions, runner) {
    this.debuggerView = new DebuggerView()
    this.runner = runner
    this.runner.onOutput((output) => this.debuggerView.writeLine(output))

    subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri === DebuggerView.agkDebuggerURI) {
        return this.debuggerView
      }
    }))

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:debug': () => this.debug(),
      'atom-agk:toggle-debugger': () => this.toggleDebugger()
    }))

    subscriptions.add(new Disposable(() => {
      this.runner.stop()
      atom.workspace.getPaneItems().forEach(item => {
        if (item instanceof DebuggerView) {
          item.destroy()
        }
      })
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
