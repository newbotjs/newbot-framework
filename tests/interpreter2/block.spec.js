const assert = require('assert')
const {
    ConverseTesting,
    bot,
    user
} = require('../../testing')

describe('Block Spec', () => {
    let converse, userConverse

    function code(str) {
        converse = new ConverseTesting({
            code: str,
            functions: {
                calc() {
                    return 1+1
                }
            }
        })
        userConverse = converse.createUser()
    }

    it('Function in Block', () => {
        code(`
            @Event('start')
            start() {
                if (true) {
                    nb = calc()
                    > { nb }
                }
            }
        `)
        return userConverse
            .conversation(
                bot `2`
            )
    })

})
