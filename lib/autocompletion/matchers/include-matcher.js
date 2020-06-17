'use babel'
const REGEX = String.raw`\s*#include\s+"(?<iname>[^"]+)"\s*(\n|$)`
let INCLUDED_FILES = []

export default class IncludeMatcher {
  get regex () {
    return REGEX
  }

  handleMatch (match) {
    const filePathRelativeToProject = match.groups.iname
    if (!INCLUDED_FILES.includes(filePathRelativeToProject)) {
      INCLUDED_FILES.push(filePathRelativeToProject)
    }

    return null
  }

  static get files () {
    return INCLUDED_FILES
  }

  static clear () {
    INCLUDED_FILES = []
  }
}
