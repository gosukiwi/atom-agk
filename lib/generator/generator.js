'use babel'
import fs from 'fs'
import path from 'path'
import GeneratorModalPanel from './generator-modal-panel'
const fsPromises = fs.promises

// formats as YYYY-MM-DD
function formatDate (date) {
  let month = '' + (date.getMonth() + 1)
  let day = '' + date.getDate()
  const year = date.getFullYear()

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return `${year}-${month}-${day}`
}

export default class Generator {
  constructor ({ subscriptions }) {
    this.panel = new GeneratorModalPanel()

    subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-agk:generate-project': () => this.create()
    }))
    subscriptions.add(this.panel)
  }

  create () {
    atom.pickFolder((folders) => {
      if (folders === null) return

      const folder = folders[0]
      const disposable = this.panel.on('create-requested', async (projectName) => {
        disposable.dispose()

        const newdir = path.join(folder, projectName)
        await fsPromises.mkdir(newdir)
        await this.generate(newdir, projectName)
        atom.open({ pathsToOpen: [newdir], newWindow: true, devMode: false, safeMode: false })
      })

      this.panel.show()
    })
  }

  // private

  async generate (newdir, projectName) {
    const assetdir = path.join(__dirname, '..', 'assets')
    const files = await fsPromises.readdir(assetdir)

    return Promise.all(files.map((fileName) => {
      const from = path.join(assetdir, fileName)
      const to = path.join(newdir, fileName)
      return this.writeFile(from, to, projectName)
    }))
  }

  async writeFile (from, to, projectName) {
    const data = await fsPromises.readFile(from, 'utf8')
    const text = data.replace('{name}', projectName).replace('{date}', formatDate(new Date()))
    return fsPromises.writeFile(to, text)
  }
}
