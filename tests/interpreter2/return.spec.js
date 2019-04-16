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
                val = math(1)
                > { val }
            }

            math(a) {
                return a + :text
            }
        `)
        return userConverse.conversation(
            user `2`,
            bot `3`
        )
    })

   
    
    it('Return value with Prompt', () => {
         code(`
             @Event('start')
             start() {
                 val = math(1) + 2
                 > { val }
             }

             math(a) {
                 > enter a number
                 Prompt()
                 return a + :text
             }
         `)
         return userConverse.conversation(
             user `start`,
             bot `enter a number`,
             user `3`,
             bot `6`
         )
     })

     it('Return value with Prompt but parent-child relation', () => {
        
        code(`
            @Event('start')
            start() {
                ret = child.test()
                > { ret }
            }
        `)

        converse.setSkills({
            child: {
                code: `
                   test() {
                       Prompt()
                       return :text
                   }
                `
            }
        })
        
        return userConverse.conversation(
            user `start`,
            user `yo`,
            bot `yo`
        )
    })

    

   it('Return value other function', () => {
    code(`
        @Event('start')
        start() {
            val = foo(2)
            > { val }
        }

        foo(a) {
            return a + math(3)
        }

        math(b) {
            Prompt()
            return b + :text
        }
    `)
    return userConverse.conversation(
        user `go`,
        user `2`,
        bot `7`
    )
})

})
