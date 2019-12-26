const assert = require('assert')
const {
    ConverseTesting,
    bot,
    user
} = require('../../testing')

describe('Pause script', () => {
    let converse, userConverse

    function code(str) {
        converse = new ConverseTesting({
            code: str
        })
        userConverse = converse.createUser()
    }

    it('test Pause function', () => {
        code(`
            @Event('start')
            start() {
                > Hello
                Pause()
                > Thanks
            }
        `)
        return userConverse
            .start(testing => {
                assert.equal(testing.output(0), 'Hello')
            })
            .continue(testing => {
                assert.equal(testing.output(0), 'Thanks')
            })
            .end()
    })

    it('test Pause function and get value', () => {
        code(`
            @Event('start')
            start() {
                > Hello
                Pause()
                > Thanks
            }
        `)
        return userConverse
            .start(testing => {
                assert.equal(testing.output(0), 'Hello')
            })
            .continue({ foo: 'test' }, testing => {
                const event = testing.magicVariable('event')
                assert.equal(event.foo, 'test')
                assert.equal(testing.output(0), 'Thanks')
            })
            .end()
    })
})