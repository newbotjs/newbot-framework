const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('Event Test', () => {
    let converse, user

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        user = converse.createUser()
    }

    it('call event', () => {
        code(`
            @Event('on', 'custom')
            custom() {
                > Hello
            }
        `)
        user
            .event('custom', testing => {
                assert.equal(testing.output(0), 'Hello')
            })
            .end()
    })
})