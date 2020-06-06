'use babel'
import { CompositeDisposable } from 'atom'
import Linter from '../lib/linter'
import Compiler from '../lib/compiler'
import Environment from '../lib/environment'
import Terminal from '../lib/terminal/terminal'

describe('Linter', () => {
  describe('.lint', () => {
    it('calls setMessages on the linter service', () => {
      const environment = new Environment()
      const subscriptions = new CompositeDisposable()
      const terminal = new Terminal(subscriptions)
      const compiler = new Compiler({ subscriptions, terminal })
      const service = { setMessages: jasmine.createSpy('setMessages') }
      const linter = new Linter({ linter: service, compiler, environment })
      spyOn(environment, 'projectPath').andReturn('C:\\Foo')

      waitsForPromise(() => linter.lint({ file: 'bar.agc', line: 1, message: 'Hello, World!' }))

      runs(() => {
        expect(service.setMessages).toHaveBeenCalledWith('C:\\Foo\\bar.agc', [{
          severity: 'error',
          location: {
            file: 'C:\\Foo\\bar.agc',
            position: [[0, 0], [0, 0]]
          },
          excerpt: 'Hello, World!'
        }])
      })
    })
  })
})
