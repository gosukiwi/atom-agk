'use babel'
import { Emitter } from 'atom'

const AGK_DEBUGGER_URI = 'atom://agk-debugger'
const ENTER_KEY_CODE = 13
const ARROW_UP_KEY_CODE = 38
const ARROW_DOWN_KEY_CODE = 40

export default class DebuggerView {
  constructor (serializedState) {
    this.emitter = new Emitter()
    this.history = []
    this.historyIndex = 0
    this.element = document.createElement('div')
    this.element.classList.add('agk-debugger')
    this.element.innerHTML = `
      <div class="agk-debugger__controls">
        <div class='btn-group'>
          <button class='btn continue'><span class="icon icon-playback-play"></span> Continue</button>
          <button class='btn'><span class="icon icon-primitive-square"></span> Stop</button>
          <button class='btn'><span class="icon icon-playback-pause"></span> Pause</button>
        </div>
      </div>
      <ul class="agk-debugger__output"></ul>
      <div class="agk-debugger__prompt">
        <span>&gt;</span>
        <input type="text" class="native-key-bindings">
      </div>
    `

    this.output = this.element.querySelector('.agk-debugger__output')
    this.prompt = this.element.querySelector('.agk-debugger__prompt input')

    this.element.querySelector('.btn.continue').addEventListener('click', () => {
      this.emitter.emit('continue-pressed')
    })

    this.prompt.addEventListener('keyup', (event) => {
      if (event.keyCode === ENTER_KEY_CODE) {
        const command = this.prompt.value
        this.history.push(command)
        this.emitter.emit('command-entered', command)
        this.prompt.value = ''
        this.historyIndex = -1
      } else if (event.keyCode === ARROW_UP_KEY_CODE) {
        this.goBackInHistory()
      } else if (event.keyCode === ARROW_DOWN_KEY_CODE) {
        this.goForthInHistory()
      }
    })

    this.clear()
  }

  goBackInHistory () {
    if (this.history.length === 0) return

    this.historyIndex = (this.historyIndex + 1) % this.history.length
    const value = this.history[this.history.length - 1 - this.historyIndex]
    this.prompt.value = value
  }

  goForthInHistory () {
    if (this.history.length === 0) return

    this.historyIndex = this.historyIndex - 1
    if (this.historyIndex < 0) this.historyIndex = this.history.length - 1
    const value = this.history[this.history.length - 1 - this.historyIndex]
    this.prompt.value = value
  }

  onCommandEntered (cb) {
    this.emitter.on('command-entered', cb)
  }

  onContinuePressed (cb) {
    this.emitter.on('continue-pressed', cb)
  }

  writeLine (line) {
    const li = document.createElement('li')
    li.appendChild(document.createTextNode(line))
    this.output.appendChild(li)
    this.output.scrollTop = this.output.scrollHeight
  }

  appendLine (text) {
    const li = this.output.querySelector('li:last-child')
    li.appendChild(document.createTextNode(text))
    this.output.scrollTop = this.output.scrollHeight
  }

  clear () {
    this.output.innerHTML = '<li>AGK Debugger Console. Not connected.</li>'
  }

  static get agkDebuggerURI () {
    return AGK_DEBUGGER_URI
  }

  // Tear down any state and detach
  destroy () {
    this.element.remove()
    // TODO: Dispose emit events?
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
}
