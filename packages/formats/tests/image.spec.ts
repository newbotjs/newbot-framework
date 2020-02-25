import assert from 'assert'
import formatsFn from '../src'

const formats = formatsFn('en_EN')

describe('Image Test', () => {
    describe('Messenger Test', () => {

        const session = {
            message: {
                source: 'messenger',
                agent: 'bottender'
            }
        }
        const text = 'hey'

        it('Messenger Test', () => {
            const contentUrl = 'http://test'
            const output = formats['image'](text, [contentUrl], { session })
            assert.deepEqual(output, [
                text,
                {
                    method: 'sendImage',
                    params: [
                        contentUrl
                    ]
                }
            ])
        })
    })
})