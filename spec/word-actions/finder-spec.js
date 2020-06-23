'use babel'
import Finder from '../../lib/word-actions/finder'

describe('HelpOpener', () => {
  describe('.getWordAtColumn', () => {
    it('finds the proper word', () => {
      const opener = new Finder()

      const match = opener.getWordAtColumn('  Print()', 2)

      expect(match).toBe('Print')
    })
  })
})
