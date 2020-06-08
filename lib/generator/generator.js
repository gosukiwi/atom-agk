'use babel'
import GeneratorModalPanel from './generator-modal-panel'

export default class Generator {
  constructor (subscriptions) {
    const panel = new GeneratorModalPanel()
    panel.on('create-requested', (name) => this.create(name))

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:generate-project': () => panel.show()
    }))
    subscriptions.add(panel)
  }

  create (name) {
    console.log('create', name)
  }
}
