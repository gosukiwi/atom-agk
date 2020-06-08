'use babel'
import GeneratorModalView from './generator-modal-view'

export default class GeneratorModalPanel {
  constructor () {
    this.view = new GeneratorModalView()
    this.panel = atom.workspace.addModalPanel({
      item: this.view.getElement(),
      visible: false
    })

    this.view.on('cancel-requested', (name) => this.hide())
    this.view.on('create-requested', (name) => this.hide())
  }

  show () {
    this.view.clearNameInput()
    this.panel.show()
    this.view.focusNameInput()
  }

  hide () {
    this.panel.hide()
  }

  on (name, cb) {
    this.view.on(name, cb)
  }

  dispose () {
    this.panel.destroy()
    this.view.destroy()
  }
}
