'use babel'

import { Emitter, Disposable } from 'atom'
import SymbolExplorerView from './symbol-explorer-view'
const AGK_DEBUGGER_URI = 'atom://agk-symbol-explorer'

export default class SymbolExplorer {
  constructor ({ subscriptions, suggestions }) {
    this.emitter = new Emitter()
    this.view = new SymbolExplorerView()

    subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri === AGK_DEBUGGER_URI) {
        return this
      }
    }))

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:toggle-symbol-explorer': () => this.toggle()
    }))

    subscriptions.add(new Disposable(() => {
      atom.workspace.getPaneItems().forEach(item => {
        if (item instanceof SymbolExplorer) {
          item.destroy()
        }
      })
    }))

    subscriptions.add(suggestions.on('definition-set', ({ file, definitions }) => {
      this.view.updateFile(file, definitions)
    }))

    subscriptions.add(suggestions.on('definition-cleared', (file) => {
      this.view.clearFile(file)
    }))

    subscriptions.add(atom.workspace.observeActiveTextEditor((editor) => {
      if (editor === undefined) {
        this.view.setCurrentEditor(null)
        return
      }

      this.view.setCurrentEditor(editor.getPath())
    }))

    if (atom.config.get('atom-agk.open-symbol-explorer-on-load')) {
      this.open()
    }
  }

  destroy () {
    return this.view.destroy()
  }

  getElement () {
    return this.view.element
  }

  getTitle () {
    return 'AGK Symbol Explorer'
  }

  getURI () {
    return AGK_DEBUGGER_URI
  }

  getDefaultLocation () {
    return 'right'
  }

  toggle () {
    atom.workspace.toggle(AGK_DEBUGGER_URI)
  }

  open () {
    return atom.workspace.open(AGK_DEBUGGER_URI)
  }

  close () {
    atom.workspace.hide(AGK_DEBUGGER_URI)
  }
}
