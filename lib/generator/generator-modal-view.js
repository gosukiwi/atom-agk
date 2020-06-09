'use babel'
/** @jsx etch.dom */

import { Emitter } from 'atom'
import etch from 'etch'
const ESCAPE_KEY_CODE = 27
const ENTER_KEY_CODE = 13
const DEFAULT_STATE = {}

export default class GeneratorModalView {
  constructor (state = {}) {
    this.state = Object.assign(DEFAULT_STATE, state)
    this.emitter = new Emitter()
    etch.initialize(this)
  }

  render () {
    return <atom-panel class='agk-generate-project modal'>
      <input on={{ keydown: this.handleOnKeyDown }} ref='nameInput' class='input-text' type='text' placeholder='Project name' />
      <div class='agk-generate-project__action'>
        <button on={{ click: this.handleCreateClicked }} class='btn btn-primary'>Create</button>
        <button on={{ click: this.handleCancelClicked }} class='btn'>Cancel</button>
      </div>
    </atom-panel>
  }

  handleOnKeyDown (e) {
    if (e.keyCode === ENTER_KEY_CODE) {
      this.emitter.emit('create-requested', this.refs.nameInput.value)
    } else if (e.keyCode === ESCAPE_KEY_CODE) {
      this.emitter.emit('cancel-requested')
    }
  }

  handleCreateClicked () {
    this.emitter.emit('create-requested', this.refs.nameInput.value)
  }

  handleCancelClicked () {
    this.emitter.emit('cancel-requested')
  }

  focusNameInput () {
    this.refs.nameInput.focus()
  }

  clearNameInput () {
    this.refs.nameInput.value = ''
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
