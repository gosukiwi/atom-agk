'use babel';

import { CompositeDisposable, Emitter } from 'atom';
import process from 'process';
import { spawn } from 'child_process'
import path from 'path'

export default {
  subscriptions: null,

  config: {
    agk_compiler_path: {
      title: "AGK Compiler Path",
      description: "The full path to the AGK compiler executable.",
      type: 'string',
      default: 'D:\\Games\\Steam\\steamapps\\common\\App Game Kit 2\\Tier 1\\Compiler\\AGKCompiler.exe'
    }
  },

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.emitter = new Emitter();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:compile-and-run': () => this.compileAndRun(),
      'atom-agk:compile': () => this.compile(),
      'atom-agk:debug': () => this.debug()
    }))
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  compile(flag = '-agk') {
    const currentEditor = atom.workspace.getActiveTextEditor()
    const currentFilePath = currentEditor.getPath();

    // save file before compiling
    const disposables = new CompositeDisposable()
    disposables.add(currentEditor.onDidSave(() => {
      const cmd = spawn(this.getCompilerPath(), [flag, currentFilePath], { cwd: this.getProjectPath() });
      let stdout = '';

      cmd.stdout.on('data', (data) => {
        stdout = `${data}`;
      });

      // The compiler does not use stderr
      // cmd.stderr.on('data', (data) => {
      //   console.error(`stderr: ${data}`);
      // });

      cmd.on('close', (res) => {
        if (res === 0) {
          this.emitter.emit('compiler-succeeded')
        } else {
          this.emitter.emit('compiler-failed', stdout)
        }
      });

      disposables.dispose()
    }))

    currentEditor.save()
  },

  compileAndRun() {
    this.compile('-run')
  },

  consumeIndie(registerIndie) {
    const linter = registerIndie({
      name: 'AGK',
    })
    this.subscriptions.add(linter)

    // error is in the format:
    // main.agc:42: error: Unexpected token "End Of Line"
    this.subscriptions.add(this.emitter.on('compiler-failed', (error) => {
      const regex = /([^\.]+\.agc):(\d+).+error: (.+)$/
      const [_match, file, line, message] = error.trim().match(regex)

      const currentEditor = atom.workspace.getActiveTextEditor()
      const currentFilePath = currentEditor.getPath();
      const currentFileDir = path.dirname(currentFilePath);
      const filePath = path.join(currentFileDir, file)

      const end = currentEditor.lineTextForBufferRow(line - 1).length

      linter.setMessages(filePath, [{
        severity: 'error',
        location: {
          file: filePath,
          position: [[line - 1, 0], [line - 1, end]],
        },
        excerpt: message
      }])
    }))

    this.subscriptions.add(this.emitter.on('compiler-succeeded', () => {
      linter.clearMessages()
    }))
  },

  debug() {
    // run interpreter
    const interpreterPath = path.join(this.getCompilerDir(), 'interpreters', 'Windows.exe')
    const interpreterProcess = spawn(interpreterPath);

    // run broadcaster
    const broadcasterPath = path.join(this.getCompilerDir(), 'AGKBroadcaster.exe')
    const broadcasterProcess = spawn(broadcasterPath, ['-nowindow']); // this does not work, it closes instantly with return status 0

    broadcasterProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`)
    });

    broadcasterProcess.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    broadcasterProcess.on('close', (res) => {
      console.log(`res: ${res}`)
    });

    broadcasterProcess.stdin.setEncoding('utf-8')
    broadcasterProcess.stdin.write(`setproject ${this.getProjectPath()}\r\n`)
    broadcasterProcess.stdin.write("connect 127.0.0.1\r\n")
    broadcasterProcess.stdin.write("debug\r\n")
  },

  // private

  getProjectPath() {
    return atom.project.getPaths()[0]
  },

  getCompilerPath() {
    return atom.config.get('atom-agk.agk_compiler_path')
  },

  getCompilerDir() {
    return path.dirname(this.getCompilerPath())
  }
};
