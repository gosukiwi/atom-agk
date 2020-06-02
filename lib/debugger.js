'use babel'
import path from 'path'
import { spawn } from 'child_process'
import BreakpointManager from './breakpoint_manager'

export default class Debugger {
  constructor (subscriptions) {
    this.breakpoints = new BreakpointManager(subscriptions)
    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:debug': () => this.debug()
    }))
  }

  debug() {
    // run interpreter
    const interpreterPath = path.join(this.getCompilerDir(), 'interpreters', 'Windows.exe')
    const interpreterProcess = spawn(interpreterPath);

    // run broadcaster
    const broadcasterPath = path.join(this.getCompilerDir(), 'AGKBroadcaster.exe')
    const broadcasterProcess = spawn(broadcasterPath, ['-nowindow']); // this does not work, it closes instantly with return status 0

    broadcasterProcess.stdout.on('data', (data) => {
      console.log(`debugger stdout: ${data}`)
    });

    broadcasterProcess.stderr.on('data', (data) => {
      console.log(`debugger stderr: ${data}`);
    });

    broadcasterProcess.stdin.setEncoding('utf-8')
    broadcasterProcess.stdin.write(`setproject ${this.getProjectPath()}\r\n`)
    broadcasterProcess.stdin.write("connect 127.0.0.1\r\n")
    this.breakpoints.each((breakpoint) => {
      broadcasterProcess.stdin.write(`breakpoint ${breakpoint.file}:${breakpoint.line}\r\n`)
    })
    broadcasterProcess.stdin.write("debug\r\n")

    // close broadcaster when interpreter closes
    interpreterProcess.on('close', () => broadcasterProcess.kill())
  }

  // private

  getProjectPath() {
    return atom.project.getPaths()[0]
  }

  getCompilerPath() {
    return atom.config.get('atom-agk.agk_compiler_path')
  }

  getCompilerDir() {
    return path.dirname(this.getCompilerPath())
  }
}