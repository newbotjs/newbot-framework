const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('Format Test', () => {
    let converse, user

    function code(str, options = {}) {
        converse = new ConverseTesting({
            code: str,
            formats: {
                quickReplies(text, [actions]) {
                    return {
                        text,
                        actions
                    }
                },
                image(text, [image]) {
                    return {
                        text, 
                        image
                    }
                },
                smiley(str) {
                    return 'oo'
                }
            },
            ...options
        })
        user = converse.createUser()
    }

    it('test multi format', () => {
        code(`
            @Event('start')
            start() {
                @Format('image', 'test.com')
                @Format('quickReplies', ['yes', 'no'])
                > test
            }
        `)
        user
            .start(testing => {
                const obj = testing.output(0)
                assert.deepStrictEqual(obj, {
                    image: { text: 'test', image: 'test.com' },
                    quickReplies: {
                        text: { text: 'test', image: 'test.com' },
                        actions: [ 'yes', 'no' ]
                    }
                })
            })
            .end()
    })

    it('merge multi format', () => {
        code(`
            @Event('start')
            start() {
                @Format('image', 'test.com')
                @Format('quickReplies', ['yes', 'no'])
                > test
            }
        `, {
            mergeMultiFormats: true
        })
        user
            .start(testing => {
               const obj = testing.output(0)
               assert.deepStrictEqual(obj, { text: 'test', actions: [ 'yes', 'no' ], image: 'test.com' })
            })
            .end()
    })

})