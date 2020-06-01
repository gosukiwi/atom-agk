'use babel';

import AtomAgkView from './atom-agk-view';
import { CompositeDisposable, Emitter } from 'atom';
import process from 'process';
import { spawn } from 'child_process'
import path from 'path'
import { OnigRegExp, OnigScanner } from 'atom'
import fs from 'fs'

export default {

  atomAgkView: null,
  modalPanel: null,
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
    // this.atomAgkView = new AtomAgkView(state.atomAgkViewState);
    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.atomAgkView.getElement(),
    //   visible: false
    // });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.emitter = new Emitter();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:compile': () => this.compile()
    }))

    this.subscriptions.add(this.emitter.on('compiler-succeeded', () => {
      fs.readdir(this.getProjectPath(), (err, files) => {
        const executable = files.find((file) => file.endsWith('.exe'))
        spawn(path.join(this.getProjectPath(), executable))
      });
    }))
  },

  deactivate() {
    //this.modalPanel.destroy();
    this.subscriptions.dispose();
    //this.atomAgkView.destroy();
  },

  serialize() {
    return {
      //atomAgkViewState: this.atomAgkView.serialize()
    };
  },

  compile() {
    const compilerPath = atom.config.get('atom-agk.agk_compiler_path');
    const currentEditor = atom.workspace.getActiveTextEditor()
    const currentFilePath = currentEditor.getPath();
    const currentFileDir = path.dirname(currentFilePath);
    const oldWorkingDir = process.cwd()

    // save file before compiling
    this.subscriptions.add(currentEditor.onDidSave(() => {
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
          // TODO: Open exe
        } else {
          this.emitter.emit('compiler-failed', stdout)
        }
      });
    }))

    currentEditor.save()
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

  // toggle() {
  //   console.log('AtomAgk was toggled!');
  //   return (
  //     this.modalPanel.isVisible() ?
  //     this.modalPanel.hide() :
  //     this.modalPanel.show()
  //   );
  // }

};
