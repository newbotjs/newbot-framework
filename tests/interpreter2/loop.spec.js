const assert = require('assert')
const {
    ConverseTesting,
    bot,
    user
} = require('../../testing')

describe('Loop', () => {
    let converse, userConverse

    function code(str) {
        converse = new ConverseTesting()
        converse.code(str)
        userConverse = converse.createUser()
    }

    it('for of with array', () => {
        code(`
            @Event('start')
            start() {
                names = ['sam', 'jim']
                for (name of names) {
                    > { name }
                }
            }
        `)
        return userConverse.conversation(
            bot `sam`,
            bot `jim`
        )
    })

    it('for of with number', () => {
        code(`
            @Event('start')
            start() {
                for (nb of 1) {
                    > { nb }
                }
            }
        `)
        return userConverse.conversation(
            bot `0`,
            bot `1`
        )
    })

    it('for of with object', () => {
        code(`
            @Event('start')
            start() {
                obj = { a: 'sam', b: 'jim' }
                for (name of obj) {
                    > { name }
                }
            }
        `)
        return userConverse.conversation(
            bot `sam`,
            bot `jim`
        )
    })

    it('for of with prompt', () => {
        code(`
            @Event('start')
            start() {
                names = ['sam', 'jim']
                for (name of names) {
                    > { name }
                    Prompt()
                }
            }
        `)
        return userConverse.conversation(
            bot `sam`,
            user `test`,
            bot `jim`,
            user `test`
        )
    })

    it('for of with function', () => {
        code(`
            @Event('start')
            start() {
                > Go
                names = ['sam', 'jim']
                for (name of names) {
                    Prompt()
                    index = Array.indexOf(names, :text)
                    > { index }
                }
            }
        `)
        return userConverse.conversation(
            bot `Go`,
            user `sam`,
            bot `0`,
            user `jim`,
            bot `1`
        )
    })

})
