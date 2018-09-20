const assert = require('assert')
const {
    ConverseTesting,
    bot,
    user
} = require('../../testing')

describe('Else', () => {
    let converse, userConverse

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        userConverse = converse.createUser()
    }

    it('Else Block', () => {
        code(`
            @Event('start')
            start() {
                a = 10
                if (a == 1) {
                    > Noop
                }
                else {
                    > Yeh
                }
            }
        `)
        return userConverse
            .conversation(
                bot `Yeh`
            )
    })

    it('Else if Block', () => {
        code(`
            @Event('start')
            start() {
                a = 10
                if (a == 1) {
                    > Noop
                }
                else if (a > 5) {
                    > Cool
                }
                else {
                    > Yeh
                }
            }
        `)
        return userConverse
            .conversation(
                bot `Cool`
            )
    })

})
