const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('Context Test', () => {
    let converse, user

    function code(str) {
        converse = new ConverseTesting({
            code: str
        }, {
            model: __dirname + '/bot/model/model.nlp'
        })
        user = converse.createUser()
    }

    it('if user change conversation', () => {
        code(`
            @Intent('hello', [
                'hello',
                'yo'
            ])
            hello() {
                > Hey
            }
        `)
        user
            .prompt('hello', testing => {
                const output = testing.output()
                assert.equal(output.length, 1)
                assert.equal(output[0], 'Hey')
            })
            .end()
    })

})