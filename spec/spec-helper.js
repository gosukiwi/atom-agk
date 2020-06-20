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

export function unlink (name) {
  return fs.unlinkSync(name)
}

// setTimeout is hijacked by Atom spec setup, and even if we un-mock it it
// doesn't  play nice with waitFor. This is a simplistic solution but it works
// for small intervals.
export function waitsForMillis (milliseconds, label) {
  const final = Date.now() + milliseconds
  while (final < Date.now()) { /* NOOP */ }
}
