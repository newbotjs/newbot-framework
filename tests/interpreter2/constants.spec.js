const assert = require('assert')
const {
    ConverseTesting
} = require('../../index')

describe('Params Test', () => {
    let converse, user

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        user = converse.createUser()
    }

    it('Constant', () => {
        code(`
             @Event('start')
             start() {
                > { BASE_URL }
             }
         `)

        converse.constants({
            BASE_URL: 'newbot.io'
        })

        user
            .start(testing => {
                assert.equal(testing.output(0), 'newbot.io')
            })
            .end()
    })
})
