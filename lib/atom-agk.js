'use babel';

import AtomAgkView from './atom-agk-view';
import { CompositeDisposable } from 'atom';
import process from 'process';
import { spawn } from 'child_process'
import path from 'path'

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

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:compile': () => this.compile()
    }));
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
    const currentFilePath = atom.workspace.getActiveTextEditor().getPath();
    const currentFileDir = path.dirname(currentFilePath);
    const oldWorkingDir = process.cwd()

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
        console.log("Done!", res)
        // TODO: Open exe
      } else {
        this.displayError(stdout)
      }
    });
  }

  // The message is in the format:
  //
  //    main.agc:42: error: Unexpected token "End Of Line"
  //
  displayError(message) {
    
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
