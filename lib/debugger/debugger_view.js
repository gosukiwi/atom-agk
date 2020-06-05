'use babel'
/** @jsx etch.dom */

import { Emitter } from 'atom'
import etch from 'etch'

const AGK_DEBUGGER_URI = 'atom://agk-debugger'
const ENTER_KEY_CODE = 13
const ARROW_UP_KEY_CODE = 38
const ARROW_DOWN_KEY_CODE = 40
const DEFAULT_STATE = {
  started: false,
  paused: false,
  console: []
}

export default class DebuggerView {
  constructor (state = {}) {
    this.state = Object.assign(DEFAULT_STATE, state)
    this.emitter = new Emitter()
    this.history = []
    this.historyIndex = 0
    etch.initialize(this)
    this.render()
    this.clear()
  }

  render () {
    return <div class="agk-debugger">
      <div class="agk-debugger__controls">
        <div class='btn-group'>
          <button on={{ click: this.handleToggleButtonClicked }} class='btn toggle'><span class={`icon ${this.state.started ? 'icon-primitive-square' : 'icon-playback-play'}`}></span>{this.state.started ? 'Stop' : 'Start'}</button>
          <button on={{ click: this.handleContinueButtonClicked }} class={`btn continue ${this.state.paused ? '' : 'disabled'}`}><span class="icon icon-playback-fast-forward"></span> Continue</button>
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

  handleContinueButtonClicked () {
    if (!this.state.paused) return

    this.writeLine('Continuing...')
    this.emitter.emit('continue-pressed')
  }

  handleToggleButtonClicked () {
    this.emitter.emit('toggle-pressed')
  }

  handleKeyUpOnPrompt (event) {
    if (event.keyCode === ENTER_KEY_CODE) {
      const prompt = this.refs.prompt
      const command = prompt.value
      prompt.value = ''
      prompt.focus()
      this.history.push(command)
      this.historyIndex = -1
      this.writeLine(`> ${command}`)
      this.emitter.emit('command-entered', command)
    } else if (event.keyCode === ARROW_UP_KEY_CODE) {
      this.goBackInHistory()
    } else if (event.keyCode === ARROW_DOWN_KEY_CODE) {
      this.goForthInHistory()
    }
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

  onCommandEntered (cb) {
    return this.emitter.on('command-entered', cb)
  }

  onContinuePressed (cb) {
    return this.emitter.on('continue-pressed', cb)
  }

  onTogglePressed (cb) {
    return this.emitter.on('toggle-pressed', cb)
  }

  emit (name, param) {
    this.emitter.emit(name, param)
  }

  writeLine (line) {
    const console = this.state.console.concat(line)
    this.update({ console })
  }

  clear () {
    this.update({ console: ['AGK Debugger Console. Not connected.'] })
  }

  static get agkDebuggerURI () {
    return AGK_DEBUGGER_URI
  }

  destroy () {
    // this.element.remove()
    return etch.destroy(this)
  }

  getElement () {
    return this.element
  }

  getTitle () {
    return 'AGK Debugger'
  }

  getURI () {
    return AGK_DEBUGGER_URI
  }

  getDefaultLocation () {
    return 'bottom'
  }

  update (state) {
    this.state = Object.assign(this.state, state)
    etch.update(this)
  }
}
