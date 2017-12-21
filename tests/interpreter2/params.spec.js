const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('Params Test', () => {
    let converse, user

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        user = converse.createUser()
    }

    it('array params exec', () => {
        code(`
            @Event('start')
            start() {
                > Hello
                Prompt()
                fn([:text])
            }
            fn(a) {
                > {a[0]}
            }
        `)
        user
            .start(testing => {
                assert.equal(testing.output(0), 'Hello')
            })
            .prompt('Foo', testing => {
                assert.equal(testing.output(0), 'Foo')
            })
            .end()
    })

    it('deep array params exec', () => {
       code(`
            @Event('start')
            start() {
                > Hello
                Prompt()
                fn([[[:text]]])
            }
            fn(a) {
                > {a[0][0][0]}
            }
        `)
        user
            .start(testing => {
                assert.equal(testing.output(0), 'Hello')
            })
            .prompt('Foo', testing => {
                assert.equal(testing.output(0), 'Foo')
            })
            .end()
    })
})