const assert = require('assert')
const {
    ConverseTesting
} = require('../../testing')

describe('Get Intent Params', () => {
    let converse, userConverse

    function code(str) {
        converse = new ConverseTesting({
            skills: {
               child: {
                code: `
                    @Intent('child', [
                        'ho child',
                        'get child'
                    ])
                    Child() {
                        > Child
                    }
                `
               }
            }
        })
        converse.code(str)
        userConverse = converse.createUser()
    }

    it('params in intent', () => {
        code(`
            @Intent('greetings', [
                'hey',
                'hello'
            ])
            hey() {
                > Hey
            }

            @Intent('bye', [
                'bye',
                'good bye'
            ])
            bye() {
                > Ok
            }
        `)
        converse.getAllIntents().then((intents) => {
            assert.equal(intents.length, 3)
            assert.equal(intents[0].params[0], 'greetings')
        })
    })

})
