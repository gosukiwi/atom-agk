'use babel'
import path from 'path'
import Environment from '../environment'
import Scanner from './scanner'
import BUILT_IN_DEFINITIONS from './built-in-definitions'

export default class Suggestions {
  constructor ({ subscriptions, environment, scanner }) {
    this.scanner = scanner || new Scanner()
    this.environment = environment || Environment.instance
    this.definitionTable = {}
    this.definitions = []

    this.setDefinitions('built-in', BUILT_IN_DEFINITIONS)
    this.scanProject()

    subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      editor.onDidStopChanging(() => {
        this.setDefinitions(editor.getPath(), this.scanText(editor.getText(), editor.getPath()))
      })
    }))

    subscriptions.add(this.environment)
  }

  get (prefix, file) {
    return this.definitions.filter((definition) => definition.matches(prefix, file))
  }

  // private

  scanProject () {
    const projectFilesGlob = path.join(this.environment.projectPath(), '**', '*.agc')
    this.scanner.scanPath(projectFilesGlob, ({ file, definitions }) => {
      this.setDefinitions(file, definitions)
    })
  }

  scanText (text, file) {
    return this.scanner.scanText(text, file)
  }

  setDefinitions (file, definitions) {
    // The scanner returns paths with UNIX notation (because of `npm-glob`), but
    // the Atom API returns paths with native notation, so let's make sure we
    // use consistent paths and transform Windows paths to UNIX paths.
    this.definitionTable[file.replace(/\\/g, '/')] = definitions
    this.definitions = Object.values(this.definitionTable).flat()
  }
}
