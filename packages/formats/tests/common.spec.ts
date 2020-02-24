import assert from 'assert'
import formats from '../src'

describe('Common Test', () => {
    const text = 'hey'
    it('Session not exists', () => {
        const contentUrl = 'http://test'
        const output = formats['image'](text, [contentUrl])
    })
})