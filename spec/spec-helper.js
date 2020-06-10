'use babel'
import path from 'path'

export function fixture (name) {
  if (name === undefined) return path.join(__dirname, 'fixtures')
  return path.join(__dirname, 'fixtures', name)
}
