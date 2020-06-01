'use babel';

import AtomAgkView from './atom-agk-view';
import { CompositeDisposable, Emitter } from 'atom';
import process from 'process';
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

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
      'atom-agk:compile': () => this.compile()
    }))
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  compile() {
    const compilerPath = atom.config.get('atom-agk.agk_compiler_path');
    const currentEditor = atom.workspace.getActiveTextEditor()
    const currentFilePath = currentEditor.getPath();
    const currentFileDir = path.dirname(currentFilePath);
    const oldWorkingDir = process.cwd()

    // save file before compiling
    const disposables = new CompositeDisposable()
    disposables.add(currentEditor.onDidSave(() => {
      process.chdir(currentFileDir);
      const cmd = spawn(compilerPath, ['-agk', currentFilePath]);
      let stdout = '';

      cmd.stdout.on('data', (data) => {
        stdout = `${data}`;
      });

      // The compiler does not use stderr
      // cmd.stderr.on('data', (data) => {
      //   console.error(`stderr: ${data}`);
      // });

      cmd.on('close', (res) => {
        process.chdir(oldWorkingDir);
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
    this.emitter.once('compiler-succeeded', () => {
      fs.readdir(this.getProjectPath(), (err, files) => {
        const executable = files.find((file) => file.endsWith('.exe'))
        spawn(path.join(this.getProjectPath(), executable))
      });
    })
    this.compile()
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

  // private

  getProjectPath() {
    return atom.project.getPaths()[0]
  }
};
