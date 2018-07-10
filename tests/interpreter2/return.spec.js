const assert = require('assert')
const {
    ConverseTesting,
    bot,
    user
} = require('../../testing')

describe('Params Test', () => {
    let converse, user

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        user = converse.createUser()
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
        return user.start()
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
        return user.start()
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
        return user.start()
            .spy('start', testing => {
                assert.deepEqual(testing.output(), ['A', 'B', 'Stop'])
            })
            .end()
    })

})