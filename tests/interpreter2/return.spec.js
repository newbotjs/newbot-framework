const assert = require('assert')
const {
    ConverseTesting,
    bot,
    user
} = require('../../testing')

describe('Params Test', () => {
    let converse, userConverse

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        userConverse = converse.createUser()
    }

    it('Test return level 1', () => {
        code(`
            @Event('start')
            start() {
                > Stop
                return false
                > Hello
            }
        `)
        return userConverse.start()
            .spy('start', testing => {
                assert.deepEqual(testing.output(), ['Stop'])
            })
            .end()
    })

    it('Test return level 2', () => {
        code(`
            @Event('start')
            start() {
                (true) {
                    > Stop
                    return false
                }
                > Hello
            }
            @Event('nothing')
            nothing() {
                > Noop
            }
        `)
        return userConverse.start()
            .spy('start', testing => {
                assert.deepEqual(testing.output(), ['Stop'])
            })
            .end()
    })

    it('Test return deep level', () => {
        code(`
            @Event('start')
            start() {
                (true) {
                    > A
                    (true) {
                        > B
                        (true) {
                            > Stop
                            return false
                        }
                    }
                }
                > Hello
            }
        `)
        return userConverse.start()
            .spy('start', testing => {
                assert.deepEqual(testing.output(), ['A', 'B', 'Stop'])
            })
            .end()
    })

    it('Return value', () => {
        code(`
            @Event('start')
            start() {
                val = math(1) + 2
                > { val }
            }

            math(a, b) {
                return a + :text
            }
        `)
        return userConverse.start()
            .spy('start', testing => {
                console.log(testing.output())
            })
            .end()
        return userConverse.conversation(
            user `2`,
            bot `5`
        )
    })

})
