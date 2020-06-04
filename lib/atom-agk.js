'use babel'
import { Disposable, CompositeDisposable } from 'atom'
import Compiler from './compiler'
import Debugger from './debugger/debugger'
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
    this.compiler = new Compiler({ subscriptions: this.subscriptions })
    this.debugger = new Debugger({ subscriptions: this.subscriptions })
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  consumeIndie (registerIndie) {
    const linter = registerIndie({ name: 'AGK' })
    this.linter = new Linter(linter, this.compiler)

    this.subscriptions.add(linter)
    this.subscriptions.add(new Disposable(() => linter.dispose()))
  }
}
