'use babel'
import { Emitter } from 'atom'

const AGK_DEBUGGER_URI = 'atom://agk-debugger'
const ENTER_KEY_CODE = 13

export default class DebuggerView {
  constructor(serializedState) {
    this.emitter = new Emitter()
    this.element = document.createElement('div');
    this.element.classList.add('agk-debugger');
    this.element.innerHTML = `
      <div class="agk-debugger__controls">
        <div class='btn-group'>
          <button class='btn continue'><span class="icon icon-playback-play"></span> Continue</button>
          <button class='btn'><span class="icon icon-primitive-square"></span> Stop</button>
          <button class='btn'><span class="icon icon-playback-pause"></span> Pause</button>
        </div>
      </div>
      <ul class="agk-debugger__output">
        <li>AGK Debugger Console...</li>
      </ul>
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
        command = this.prompt.value
        this.emitter.emit('command-entered', command)
        this.prompt.value = ''
      }
    })
  }

  onCommandEntered(cb) {
    this.emitter.on('command-entered', cb)
  }

  onContinuePressed(cb) {
    this.emitter.on('continue-pressed', cb)
  }

  writeLine(line) {
    const li = document.createElement('li')
    li.appendChild(document.createTextNode(line))
    this.output.appendChild(li)
    this.output.scrollTop = this.output.scrollHeight;
  }

  clear() {
    this.output.innerHTML = '<li>AGK Debugger Console...</li>'
  }

  static get agk_debugger_uri() {
    return AGK_DEBUGGER_URI
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
    // TODO: Dispose emit events?
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return 'AGK Debugger'
  }

  getURI() {
    return AGK_DEBUGGER_URI
  }

  getDefaultLocation() {
    return 'bottom'
  }
}
