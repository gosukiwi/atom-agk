'use babel'
/** @jsx etch.dom */

import { Emitter } from 'atom'
import etch from 'etch'
import Function from '../autocompletion/definitions/function'
const DEFAULT_STATE = {
  files: {},
  keyword: null,
  currentEditor: null
}

export default class TerminalView {
  constructor (state = {}) {
    this.state = Object.assign(DEFAULT_STATE, state)
    this.emitter = new Emitter()
    etch.initialize(this)
  }

  render () {
    return <div class='agk-symbol-explorer'>
      <input type='search' class='input-search native-key-bindings' placeholder='Search' on={{ input: this.handleSearchChanged }} />
      {this.getFiles().map(({ file, functions }) => {
        const name = atom.project.relativizePath(file)[1]
        return <div>
          <span class='agk-symbol-explorer__filename'>{name}</span>
          <ul class='agk-select-list'>
            {functions.map((func) => {
              return <li on={{ click: () => this.handleDefinitionClicked(func) }}>
                <span class='agk-select-badge-blue'>f</span>
                <span>{func.name}({func.args.map((arg) => arg[0]).join(', ')})</span>
              </li>
            })}
          </ul>
        </div>
      })}
    </div>
  }

  handleDefinitionClicked (definition) {
    this.open(definition.file, definition.index)
  }

  handleSearchChanged (e) {
    const value = e.target.value
    if (value) {
      this.state.keyword = new RegExp(value, 'i')
    } else {
      this.state.keyword = null
    }
    this.update()
  }

  getFiles () {
    return Object
      .keys(this.state.files)
      .sort((a, b) => {
        if (a === this.state.currentEditor) return -1
        if (b === this.state.currentEditor) return 1

        return a.localeCompare(b)
      })
      .map((file) => {
        return { file, functions: this.getFunctions(this.state.files[file]) }
      })
      .filter(({ functions }) => functions.length > 0)
  }

  getFunctions (definitions) {
    return definitions
      .filter((definition) => {
        if (this.state.keyword === null) return definition instanceof Function

        return definition instanceof Function && this.state.keyword.test(definition.name)
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  destroy () {
    return etch.destroy(this)
  }

  getElement () {
    return this.element
  }

  updateFile (file, definitions) {
    this.state.files[file] = definitions
    this.update()
  }

  clearFile (file) {
    delete this.state.files[file]
    this.update()
  }

  setCurrentEditor (path) {
    this.state.currentEditor = path
    this.update()
  }

  update () {
    etch.update(this)
  }

  open (file, index) {
    return new Promise((resolve) => {
      atom.workspace.open(file).then(() => {
        const editor = atom.workspace.getActiveTextEditor()
        const position = editor.getBuffer().positionForCharacterIndex(index)
        editor.setCursorBufferPosition(position)
        resolve()
      })
    })
  }
}
