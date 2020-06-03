'use babel'

const AGK_DEBUGGER_URI = 'atom://agk-debugger'

export default class DebuggerView {
  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('agk-debugger');
    this.element.innerHTML = `
      <div class="agk-debugger__controls">
        <div class='btn-group'>
          <button class='btn'><span class="icon icon-playback-play"></span> Continue</button>
          <button class='btn'><span class="icon icon-primitive-square"></span> Stop</button>
          <button class='btn'><span class="icon icon-playback-pause"></span> Pause</button>
        </div>
      </div>
      <div class="agk-debugger__output">
        AGK Debugger Console... Ready!
      </div>
      <div class="agk-debugger__prompt">
        <span>&gt;</span>
        <input type="text" class="native-key-bindings">
      </div>
    `

    //this.output = this.element.querySelector('.agk-debugger__output')
    //this.prompt = this.element.querySelector('.agk-debugger__prompt')
  }

  static get agk_debugger_uri() {
    return AGK_DEBUGGER_URI
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
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
