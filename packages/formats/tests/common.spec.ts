import assert from 'assert'
import formatsFn from '../src'

const formats = formatsFn('en_EN')

describe('Common Test', () => {
    const text = 'hey'
    it('Session not exists', () => {
        const contentUrl = 'http://test'
        const output = formats['image'](text, [contentUrl])
    })
})