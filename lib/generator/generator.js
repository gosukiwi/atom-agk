'use babel'
import GeneratorModalPanel from './generator-modal-panel'

export default class Generator {
  constructor (subscriptions) {
    this.panel = new GeneratorModalPanel()
    this.panel.on('create-requested', (name) => this.create(name))

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:generate-project': () => this.generate()
    }))
    subscriptions.add(this.panel)
  }

  generate () {
    this.panel.show()
  }

  create (name) {
    console.log('create', name)
    this.panel.hide()
  }
}
