'use babel'
import { Disposable } from 'atom'
import BreakpointManager from './breakpoint_manager'
import Runner from './runner'
const REGEX = /Break:([^.]+\.agc):(\d+)/

export default class Debugger {
  constructor ({ subscriptions, compiler, runner, terminal }) {
    this.compiler = compiler
    this.terminal = terminal
    this.runner = runner || new Runner({ breakpoints: new BreakpointManager(subscriptions) })

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:debug': () => this.start()
    }))

    subscriptions.add(new Disposable(() => {
      this.stop()
    }))

    subscriptions.add(this.runner)

    this.runner.onOutput((output) => {
      this.terminal.write(output.trim().split('\n').filter((line) => line).map((line) => `< ${line}`))
      this.highlightBreakpointIfNeeded(output)
    })

    this.runner.onStarted(() => {
      this.terminal.start()
    })

    this.runner.onStopped(() => {
      this.terminal.stop()
    })

    this.terminal.onCommandEntered((command) => {
      this.runner.watch(command)
    })

    this.terminal.onContinuePressed(() => {
      this.runner.continue()
    })

    this.terminal.onTogglePressed(() => {
      this.toggle()
    })
  }

  start () {
    this.terminal.open()
    const disposable = this.compiler.onCompilationSucceeded(() => {
      disposable.dispose()
      this.runner.start()
    })
    this.compiler.compile()
  }

  stop () {
    this.runner.stop()
  }

  toggle () {
    this.runner.started ? this.stop() : this.start()
  }

  highlightBreakpointIfNeeded (output) {
    const result = output.trim().match(REGEX)
    if (result === null) return

    const [, file, line] = result
    atom.workspace.open(file).then((editor) => {
      atom.focus()
      editor.setCursorBufferPosition([line - 1, 0])
      this.terminal.pause()
      setTimeout(() => this.terminal.focusPrompt(), 500) // hacky because `terminal.update` is async
    })
  }
}
