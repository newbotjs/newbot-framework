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

    it('Else with Prompt()', () => {
        code(`
            @Event('start')
            start() {
                if (2 == 1) {
                    > a
                }
                else {
                   if (1 == 1) {
                       if (2 == 1) {
                            > c
                       }
                       else {
                            Prompt()
                            > b
                       }
                   }
                }
            }
        `)
        return userConverse
            .start()  
            .prompt('test', testing => {
                assert.equal(testing.output(0), 'b')
            })
            .end()
    })

})
