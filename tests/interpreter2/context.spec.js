const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('Context Test', () => {
    
    let converse, user

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        user = converse.createUser()
    }

    it('if user change conversation', () => {
        code(`
            @Event('start')
            start() {
                > Your name ?
                Prompt()
                > Ok {:text}
            }

            @Intent('hello')
            hello() {
                > Hey
            }
        `)
        converse.nlp('regexp', {
            hello(str) {
                const match = str.match(/hello/)
                if (!match) return false
                return true
            }
        })
        user
            .start(testing => {
                assert.equal(testing.output(0), 'Your name ?')
            })
            .prompt('hello', testing => {
                const output = testing.output()
                assert.equal(output.length, 1)
                assert.equal(output[0], 'Hey')
            })
            .prompt('sam', testing => {
                const output = testing.output()
            })
            .end()
    })

})