'use babel'
import { CompositeDisposable } from 'atom'
import Debugger from './debugger/debugger'
import Compiler from './compiler/compiler'
import Linter from './linter'

export default {
  subscriptions: null,
  debugger: null,
  compiler: null,
  linter: null,
  config: {
    agk_compiler_path: {
      title: 'AGK Compiler Path',
      description: 'The full path to the AGK compiler executable.',
      type: 'string',
      default: 'D:\\Games\\Steam\\steamapps\\common\\App Game Kit 2\\Tier 1\\Compiler\\AGKCompiler.exe'
    }
  },

  activate (state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()
    this.debugger = new Debugger({ subscriptions: this.subscriptions })
    this.compiler = new Compiler(this.subscriptions)
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  consumeIndie (registerIndie) {
    const linter = registerIndie({ name: 'AGK' })
    this.subscriptions.add(linter)
    this.linter = new Linter(linter, this.compiler)
  }
}
