'use babel'
import path from 'path'
const REGEX = String.raw`\s*#(?:include|insert)\s+"(?<iname>[^"]+)"\s*(\n|$)`

export default class GoToDefinition {
  constructor ({ subscriptions }) {
    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:go-to-include': () => this.goToInclude()
    }))
  }

  goToInclude () {
    const editor = atom.workspace.getActiveTextEditor()
    const position = editor.getCursorBufferPosition()
    const match = editor.lineTextForBufferRow(position.row).match(REGEX)
    if (match === null) return

    const filerelativepath = match.groups.iname
    const projectpath = this.projectFor(editor)
    if (projectpath === undefined) return

    this.open(path.join(projectpath, filerelativepath))
  }

  projectFor (editor) {
    const projectPaths = atom.project.getPaths()
    const editorPath = editor.getPath()
    return projectPaths.find((p) => editorPath.startsWith(p))
  }

  open (file) {
    return atom.workspace.open(file)
  }
}
