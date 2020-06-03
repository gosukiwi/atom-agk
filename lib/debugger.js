'use babel'
import path from 'path'
import { spawn } from 'child_process'
import { Disposable } from 'atom'
import BreakpointManager from './breakpoint_manager'
import DebuggerView from './debugger_view'

export default class Debugger {
  constructor (subscriptions) {
    this.debuggerView = new DebuggerView()
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

    this.breakpoints = new BreakpointManager(subscriptions)
    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:debug': () => this.debug(),
      'atom-agk:toggle-debugger': () => this.toggleDebugger()
    }))
  }

  debug () {
    this.debuggerView.clear()
    this.debuggerView.writeLine('Connecting...')

    // run interpreter
    const interpreterPath = path.join(this.getCompilerDir(), 'interpreters', 'Windows.exe')
    const interpreterProcess = spawn(interpreterPath)

    // run broadcaster
    const broadcasterPath = path.join(this.getCompilerDir(), 'AGKBroadcaster.exe')
    const broadcasterProcess = spawn(broadcasterPath, ['-nowindow']) // this does not work, it closes instantly with return status 0
    this.debuggerView.appendLine(' Connected!')

    broadcasterProcess.stdout.on('data', (data) => {
      console.log(`debugger stdout: ${data}`)
      this.debuggerView.writeLine(`< ${data}`)
    })

    broadcasterProcess.stderr.on('data', (data) => {
      console.log(`debugger stderr: ${data}`)
    })

    broadcasterProcess.stdin.setEncoding('utf-8')
    broadcasterProcess.stdin.write(`setproject ${this.getProjectPath()}\r\n`)
    broadcasterProcess.stdin.write('connect 127.0.0.1\r\n')
    this.breakpoints.each((breakpoint) => {
      broadcasterProcess.stdin.write(`breakpoint ${breakpoint.file}:${breakpoint.line}\r\n`)
    })
    broadcasterProcess.stdin.write('debug\r\n')

    this.debuggerView.onCommandEntered((command) => {
      this.debuggerView.writeLine(`> ${command}`)
      broadcasterProcess.stdin.write(`watch ${command}\r\n`)
    })

    this.debuggerView.onContinuePressed(() => {
      this.debuggerView.writeLine('Continuing...')
      broadcasterProcess.stdin.write('continue\r\n')
    })

    // close broadcaster when interpreter closes
    interpreterProcess.on('close', () => {
      this.debuggerView.writeLine('Done.')
      broadcasterProcess.kill()
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

  // private

  getProjectPath () {
    return atom.project.getPaths()[0]
  }

  getCompilerPath () {
    return atom.config.get('atom-agk.agk_compiler_path')
  }

  getCompilerDir () {
    return path.dirname(this.getCompilerPath())
  }
}
