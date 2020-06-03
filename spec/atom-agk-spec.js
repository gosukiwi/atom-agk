'use babel'

// import AtomAgk from '../lib/atom-agk'

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('AtomAgk', () => {
  it('activates when opening an `.agc` file', () => {
    // Activate package
    waitsForPromise(() => atom.workspace.open('demo.agc'))
    waitsForPromise(() => atom.packages.activatePackage('atom-agk'))
    atom.packages.triggerDeferredActivationHooks()

    runs(() => {
      expect(atom.packages.isPackageActive('atom-agk')).toBe(true)
    })
  })
})
