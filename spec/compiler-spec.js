'use babel'
import { CompositeDisposable } from 'atom'
import Compiler from '../lib/compiler'
import Process from '../lib/process'
import Environment from '../lib/environment'

describe('Compiler', () => {
  describe('commands', () => {
    it('binds atom-agk:toggle-debugger to .toggleDebuggerWindow', () => {
      const subscriptions = new CompositeDisposable()
      const process = Process.null()
      const compiler = new Compiler({ subscriptions, process })
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(compiler, 'compile')

      atom.commands.dispatch(workspaceElement, 'atom-agk:compile')

      expect(compiler.compile).toHaveBeenCalled()
    })

    it('binds "atom-agk:debug" to .debug', () => {
      const subscriptions = new CompositeDisposable()
      const process = Process.null()
      const compiler = new Compiler({ subscriptions, process })
      const workspaceElement = atom.views.getView(atom.workspace)
      spyOn(compiler, 'compileAndRun')

      atom.commands.dispatch(workspaceElement, 'atom-agk:compile-and-run')

      expect(compiler.compileAndRun).toHaveBeenCalled()
    })
  })

  describe('.compile', () => {
    it('starts the compiler process with proper params', () => {
      const subscriptions = new CompositeDisposable()
      const process = Process.null()
      const env = new Environment()
      const compiler = new Compiler({ subscriptions, process, env })
      spyOn(env, 'projectPath').andReturn('C:\\MyProject')
      spyOn(env, 'compilerPath').andReturn('C:\\Compiler.exe')
      spyOn(process, 'start')

      waitsForPromise(() => atom.workspace.open('foo.agc'))
      waitsForPromise(() => compiler.compile())

      runs(() => {
        const currentEditor = atom.workspace.getActiveTextEditor()
        const currentFilePath = currentEditor.getPath()
        expect(process.start).toHaveBeenCalledWith('C:\\Compiler.exe', ['-agk', currentFilePath], { cwd: 'C:\\MyProject' })
      })
    })
  })

  describe('.compileAndRun', () => {
    it('starts the compiler process with proper params', () => {
      const subscriptions = new CompositeDisposable()
      const process = Process.null()
      const env = new Environment()
      const compiler = new Compiler({ subscriptions, process, env })
      spyOn(env, 'projectPath').andReturn('C:\\MyProject')
      spyOn(env, 'compilerPath').andReturn('C:\\Compiler.exe')
      spyOn(process, 'start')

      waitsForPromise(() => atom.workspace.open('foo.agc'))
      waitsForPromise(() => compiler.compileAndRun())

      runs(() => {
        const currentEditor = atom.workspace.getActiveTextEditor()
        const currentFilePath = currentEditor.getPath()
        expect(process.start).toHaveBeenCalledWith('C:\\Compiler.exe', ['-run', currentFilePath], { cwd: 'C:\\MyProject' })
      })
    })
  })

  it('calls onCompilationSucceeded callbacks on process.onClose', () => {
    const subscriptions = new CompositeDisposable()
    const process = Process.null()
    const compiler = new Compiler({ subscriptions, process })
    let callbackCalled = false
    compiler.onCompilationSucceeded(() => { callbackCalled = true })

    process.emit('close', 0)

    expect(callbackCalled).toBe(true)
  })

  it('calls onCompilationFailed callbacks on process.onStdout', () => {
    const subscriptions = new CompositeDisposable()
    const process = Process.null()
    const compiler = new Compiler({ subscriptions, process })
    let callbackCalled = false
    compiler.onCompilationFailed(() => { callbackCalled = true })

    process.emit('stdout', 'foo')

    expect(callbackCalled).toBe(true)
  })
})
