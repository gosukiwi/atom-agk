'use babel'
import Environment from '../lib/environment'

describe('Environment', () => {
  it('.relativeToProject', () => {
    spyOn(atom.project, 'getPaths').andReturn(['C:\\Foo'])
    const environment = new Environment()

    expect(environment.relativeToProject('C:\\Foo\\Bar\\baz.agc')).toBe('Bar\\baz.agc')
  })

  it('.compilerPath', () => {
    atom.config.set('atom-agk.agk_compiler_path', 'C:\\Compiler.exe')
    const environment = new Environment()

    expect(environment.compilerPath()).toBe('C:\\Compiler.exe')
  })
})
