'use babel'
import { shell } from 'electron'
import Environment from '../environment'
import WordAction from './word-action'
import COMMAND_DEFINITIONS from '../autocompletion/built-in-definitions'

export default class HelpOpener extends WordAction {
  constructor ({ subscriptions, opener, environment, definitions }) {
    super()
    this.opener = opener || shell.openExternal
    this.environment = environment || Environment.instance
    this.definitions = definitions || COMMAND_DEFINITIONS

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:open-help': () => this.open()
    }))

    subscriptions.add(this.environment)
  }

  open () {
    const word = this.getWordUnderCursor()
    const command = this.findCommand(word)
    if (command !== undefined) {
      this.opener(this.environment.documentationPath(command.category, command.name))
    } else {
      this.opener(this.environment.documentationHomePath())
    }
  }

  findCommand (name) {
    name = name.toLowerCase()
    return this.definitions.filter((command) => command.name.toLowerCase() === name)[0]
  }
}
