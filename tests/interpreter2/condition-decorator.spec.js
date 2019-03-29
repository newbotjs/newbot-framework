const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('condition decorator', () => {
    let converse, user

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        user = converse.createUser({
            session: 111
        })
    }

    it('test condition decorator', () => {
        code(`
            @Condition('fn')
            @Event('start')
            start() {
                > Yo ?
            }

            @Event('nothing')
            nothing() {
                > Nop
            }
        `)
        converse.conditions({
             fn(data, user) {
                 return data.session != 111
             }
        })
        return user
            .start(testing => {
                assert.equal(testing.output(0), 'Nop')
            })
            .end()
    })

})