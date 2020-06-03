'use babel'
import { spawn } from 'child_process'

export default class Spawner {
  spawn (path, args) {
    const process = spawn(path, args)
    return (process.pid === undefined) ? null : process
  }
}
