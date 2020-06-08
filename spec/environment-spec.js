'use babel'
import Environment from '../lib/environment'
import { fixture } from './spec-helper'

describe('Environment', () => {
  it('.relativeToProject', () => {
    spyOn(atom.project, 'getPaths').andReturn(['C:\\Foo'])
    const environment = new Environment()

    expect(environment.relativeToProject('C:\\Foo\\Bar\\baz.agc')).toBe('Bar\\baz.agc')
  })

  describe('.compilerPath', () => {
    it('uses the setting', () => {
      atom.config.set('atom-agk.agk_compiler_path', fixture('demo.agc'))
      const environment = new Environment()

      expect(environment.compilerPath()).toBe(fixture('demo.agc'))
    })

    it('throws error if file does not exist', () => {
      atom.config.set('atom-agk.agk_compiler_path', 'C:\\Compiler.exe')
      const environment = new Environment()

      expect(environment.compilerPath).toThrow()
    })
  })
})
