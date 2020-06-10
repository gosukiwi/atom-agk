'use babel'
import { shell } from 'electron'
import Environment from './environment'
import COMMAND_DEFINITIONS from './autocompletion/built-in-definitions'
const REGEX = /[a-zA-Z0-9_]/

export default class DefinitionOpener {
  constructor ({ subscriptions, opener, environment, definitions }) {
    this.opener = opener || shell.openExternal
    this.environment = environment || Environment.instance
    this.definitions = definitions || COMMAND_DEFINITIONS

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:open-definition': () => this.open()
    }))

    subscriptions.add(this.environment)
  }

  open () {
    const editor = atom.workspace.getActiveTextEditor()
    const position = editor.getCursorBufferPosition()
    const line = editor.lineTextForBufferRow(position.row)
    const word = this.getWordAtColumn(line, position.column)
    const command = this.findCommand(word)
    if (command !== undefined) {
      this.opener(this.environment.documentationPath(command.category, command.name))
    } else {
      this.opener(this.environment.documentationHomePath())
    }
  }

  getWordAtColumn (line, column) {
    let left = column
    let right = column
    const len = line.length - 1

    while (left > 0) {
      if (this.isWord(line[left])) {
        left = left - 1
      } else {
        left = left + 1
        break
      }
    }

    while (right < len) {
      if (this.isWord(line[right])) {
        right = right + 1
      } else {
        right = right - 1
        break
      }
    }

    return line.substring(left, right + 1)
  }

  // private

  isWord (letter) {
    return REGEX.test(letter)
  }

  findCommand (name) {
    name = name.toLowerCase()
    return this.definitions.filter((command) => command.name.toLowerCase() === name)[0]
  }
}
