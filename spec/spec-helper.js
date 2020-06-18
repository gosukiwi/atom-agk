'use babel'
import path from 'path'
import fs from 'fs'

export function fixture (name) {
  if (name === undefined) return path.join(__dirname, 'fixtures')
  return path.join(__dirname, 'fixtures', name)
}

export function normalizePath (name) {
  return path.normalize(name)
}

export function removeFile (name) {
  return fs.unlinkSync(name)
}
