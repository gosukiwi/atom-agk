'use babel'
/** @jsx etch.dom */

import { Emitter } from 'atom'
import etch from 'etch'
const ENTER_KEY_CODE = 13
const ARROW_UP_KEY_CODE = 38
const ARROW_DOWN_KEY_CODE = 40
const DEFAULT_STATE = {
  started: false,
  paused: false,
  console: ['AGK Console. Not connected.']
}

export default class TerminalView {
  constructor (state = {}) {
    this.state = Object.assign(DEFAULT_STATE, state)
    this.emitter = new Emitter()
    this.history = []
    this.historyIndex = 0
    etch.initialize(this)
  }

  render () {
    return <div class="agk-debugger">
      <div class="agk-debugger__controls">
        <div class='btn-group'>
          <button on={{ click: this.handleCompileButtonClicked }} class='btn'><span class='icon icon-code'></span> Compile</button>
          <button on={{ click: this.handleCompileAndRunButtonClicked }} class='btn'><span class='icon icon-rocket'></span> Run</button>
        </div>
        <div class='btn-group'>
          <button on={{ click: this.handleToggleButtonClicked }} class='btn'><span class={`icon ${this.state.started ? 'icon-primitive-square' : 'icon-playback-play'}`}></span>{this.state.started ? 'Stop Debugger' : 'Debug'}</button>
          <button on={{ click: this.handleContinueButtonClicked }} class={`btn continue ${this.state.paused ? '' : 'disabled'}`}><span class="icon icon-playback-fast-forward"></span> Continue</button>
        </div>
        <div class='btn-group'>
          <button on={{ click: this.handleClearButtonClicked }} class='btn'><span class="icon icon-trashcan"></span> Clear</button>
        </div>
      </div>
      <div class="agk-debugger__output" ref='output'>
        <ul>
          {this.state.console.map((line) => <li>{line}</li>)}
        </ul>
      </div>
      <div class="agk-debugger__prompt">
        <span>&gt;</span>
        <input ref='prompt' on={{ keyup: this.handleKeyUpOnPrompt }} type="text" class="native-key-bindings" />
      </div>
    </div>
  }

  handleCompileButtonClicked () {
    this.emitter.emit('compile-pressed')
  }

  handleContinueButtonClicked () {
    if (!this.state.paused) return

    this.write('Continuing...')
    this.emitter.emit('continue-pressed')
  }

  handleToggleButtonClicked () {
    this.emitter.emit('toggle-pressed')
  }

  handleClearButtonClicked () {
    this.setState({ console: [] })
  }

  handleKeyUpOnPrompt (event) {
    if (event.keyCode === ENTER_KEY_CODE) {
      const prompt = this.refs.prompt
      const command = prompt.value
      prompt.value = ''
      prompt.focus()
      this.history.push(command)
      this.historyIndex = -1
      this.write(`> ${command}`)
      this.emitter.emit('command-entered', command)
    } else if (event.keyCode === ARROW_UP_KEY_CODE) {
      this.goBackInHistory()
    } else if (event.keyCode === ARROW_DOWN_KEY_CODE) {
      this.goForthInHistory()
    }
  }

  start () {
    this.setState({ started: true, paused: false })
  }

  stop () {
    this.setState({ started: false, paused: false })
  }

  pause () {
    this.setState({ paused: true })
  }

  write (line) {
    this.setState({ console: this.state.console.concat(line) })
  }

  focusPrompt () {
    this.refs.prompt.focus()
  }

  goBackInHistory () {
    if (this.history.length === 0) return

    this.historyIndex = (this.historyIndex + 1) % this.history.length
    const value = this.history[this.history.length - 1 - this.historyIndex]
    this.refs.prompt.value = value
  }

  goForthInHistory () {
    if (this.history.length === 0) return

    this.historyIndex = this.historyIndex - 1
    if (this.historyIndex < 0) this.historyIndex = this.history.length - 1
    const value = this.history[this.history.length - 1 - this.historyIndex]
    this.refs.prompt.value = value
  }

  on (name, cb) {
    return this.emitter.on(name, cb)
  }

  emit (name, param) {
    this.emitter.emit(name, param)
  }

  destroy () {
    return etch.destroy(this)
  }

  getElement () {
    return this.element
  }

  setState (state) {
    this.state = Object.assign(this.state, state)
    this.update()
  }

  update () {
    etch.update(this)
  }
}
