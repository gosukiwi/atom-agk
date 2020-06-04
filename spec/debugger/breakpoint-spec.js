'use babel'
import Environment from '../../lib/environment'
import Breakpoint from '../../lib/debugger/breakpoint'

describe('Breakpoint', () => {
  it('relativizes the file path', () => {
    const environment = new Environment()
    spyOn(environment, 'projectPath').andReturn('C:\\Foo')
    const breakpoint = new Breakpoint({ file: 'C:\\Foo\\Bar\\baz.agc', line: 1, decoration: null, environment })

    expect(breakpoint.file).toBe('Bar\\baz.agc')
  })
})
