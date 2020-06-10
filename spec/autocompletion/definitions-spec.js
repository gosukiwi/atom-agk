'use babel'
import { CompositeDisposable } from 'atom'
import Environment from '../../lib/environment'
import Definitions from '../../lib/autocompletion/definitions'

describe('Definitions', () => {
  it('loads built-in definitions', () => {
    const subscriptions = new CompositeDisposable()
    const environment = Environment.instance
    const definitions = new Definitions({ subscriptions, environment })

    expect(definitions.get('setspr').find((definition) => definition.name === 'SetSpriteAnimation')).not.toBeUndefined()
  })
})
