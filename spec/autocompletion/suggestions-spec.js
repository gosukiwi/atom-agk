'use babel'
import { CompositeDisposable } from 'atom'
import Environment from '../../lib/environment'
import Suggestions from '../../lib/autocompletion/suggestions'

describe('Suggestions', () => {
  it('loads built-in definitions', () => {
    const subscriptions = new CompositeDisposable()
    const environment = Environment.instance
    const definitions = new Suggestions({ subscriptions, environment })

    expect(definitions.get('setspr').find((definition) => definition.name === 'SetSpriteAnimation')).not.toBeUndefined()
  })
})
