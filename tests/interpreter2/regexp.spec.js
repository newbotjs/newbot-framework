const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('RegExp Test', () => {
    let converse, user

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        user = converse.createUser()
    }

    it('intent regexp', () => {
        code(`
            @Intent(/hello/)
            intent() {
                a = {
                    b: /a/
                }
                if (a.b.test('a')) > Hello
            }
        `)
        user
            .start()
            .prompt('hello', testing => {
                assert.equal(testing.output(0), 'Hello')
            })
            .end()
    })
})