'use babel'
import { CompositeDisposable } from 'atom'
import Compiler from './compiler'
import Debugger from './debugger/debugger'
import Linter from './linter'
import Terminal from './terminal/terminal'
import AutocompletionProvider from './autocompletion/provider'
import Generator from './generator/generator'
import HelpOpener from './word-actions/help-opener'
import GoToDefinition from './word-actions/go-to-definition'
import GoToInclude from './word-actions/go-to-include'

let subscriptions = null
let compiler = null
const config = {
  agk_compiler_path: {
    title: 'AGK Compiler Path',
    description: 'The full path to the AGK compiler executable.',
    type: 'string',
    default: 'C:\\Program Files\\Steam\\steamapps\\common\\App Game Kit 2\\Tier 1\\Compiler\\AGKCompiler.exe'
  },
  'open-terminal-on-load': {
    title: 'Open AGK terminal on initial load',
    type: 'boolean',
    default: true
  }
}

function activate (state) {
  subscriptions = new CompositeDisposable()
  const terminal = new Terminal(subscriptions)
  compiler = new Compiler({ subscriptions, terminal })
  new Debugger({ subscriptions, compiler, terminal })
  new Generator({ subscriptions })
  new HelpOpener({ subscriptions })
  new GoToDefinition({ subscriptions })
  new GoToInclude({ subscriptions })
}

function deactivate () {
  subscriptions.dispose()
}

function consumeIndie (registerIndie) {
  const service = registerIndie({ name: 'AGK' })
  const linter = new Linter({ linter: service, compiler: compiler })
  subscriptions.add(service, linter)
}

function provide () {
  AutocompletionProvider.activate(subscriptions)
  return AutocompletionProvider
}

export default {
  config,
  activate,
  deactivate,
  consumeIndie,
  provide
}
