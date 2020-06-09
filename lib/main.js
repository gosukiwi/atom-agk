'use babel'
import { Disposable, CompositeDisposable } from 'atom'
import Compiler from './compiler'
import Debugger from './debugger/debugger'
import Linter from './linter'
import Terminal from './terminal/terminal'
import DefinitionOpener from './definition-opener'
import AutocompletionProvider from './autocompletion/provider'
import Generator from './generator/generator'

export default {
  config: {
    agk_compiler_path: {
      title: 'AGK Compiler Path',
      description: 'The full path to the AGK compiler executable.',
      type: 'string',
      default: 'C:\\Program Files\\Steam\\steamapps\\common\\App Game Kit 2\\Tier 1\\Compiler\\AGKCompiler.exe'
    }
  },

  activate (state) {
    this.subscriptions = new CompositeDisposable()
    const terminal = new Terminal(this.subscriptions)
    this.compiler = new Compiler({ subscriptions: this.subscriptions, terminal })
    new Debugger({ subscriptions: this.subscriptions, compiler: this.compiler, terminal: terminal })
    new DefinitionOpener(this.subscriptions)
    new Generator({ subscriptions: this.subscriptions })
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  consumeIndie (registerIndie) {
    const linter = registerIndie({ name: 'AGK' })
    this.linter = new Linter({ linter, compiler: this.compiler })

    this.subscriptions.add(linter)
    this.subscriptions.add(new Disposable(() => linter.dispose()))
  },

  provide () {
    AutocompletionProvider.activate(this.subscriptions)
    return AutocompletionProvider
  }
}
