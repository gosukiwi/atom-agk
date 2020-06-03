'use babel'
import { Disposable } from 'atom'
import DebuggerView from './debugger_view'
import BreakpointManager from './breakpoint_manager'
import Runner from './runner'

export default class Debugger {
  constructor ({ subscriptions, runner, view }) {
    this.view = view || new DebuggerView()
    this.runner = runner || new Runner(new BreakpointManager(subscriptions))
    this.runner.onOutput((output) => this.view.writeLine(output))

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

    subscriptions.add(this.view.onCommandEntered((command) => {
      this.view.writeLine(`> ${command}`)
      this.runner.watch(command)
    }))

    subscriptions.add(this.view.onContinuePressed(() => {
      this.view.writeLine('Continuing...')
      this.runner.continue()
    }))
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
}
