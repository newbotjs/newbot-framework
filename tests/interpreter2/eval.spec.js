const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('Eval Test', () => {
    let converse, user

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        user = converse.createUser()
    }

    it('eval json converse', () => {
        code(`
            @Event('start')
            start() {
                > One
                Eval.json(\`
                    [
                        { "output": "Two" }
                    ]
                \`)
                > Three
            }
        `)
        user
            .start(testing => {
               assert.deepEqual(testing.output(), [
                   'One',
                   'Two',
                   'Three'
               ])
            })
            .end()
    })

    it('eval json converse with prompt', () => {
        code(`
            @Event('start')
            start() {
                > Your name ?
                Eval.json(\`
                    [
                        { 
                            "type": "executeFn",
                            "name": "Prompt" 
                        }
                    ]
                \`)
                > Thanks !
            }
        `)
        user
            .start(testing => {
                assert.equal(testing.output().length, 1)
                assert.equal(testing.output(0), 'Your name ?')
            })
            /*.prompt('sam', testing => {
                assert.equal(testing.output(0), 'Thanks !')
            })*/
            .end()
    })

})