const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('Module Test', () => {
    let converse, user

    before(() => {
        converse = new ConverseTesting()
        converse.code(`
            @Event('start')
            start() {
                child.hello()
            }
        `)
        converse.skill('child')
        user = converse.createUser()
    })

    it('', () => {
        user
            .start(testing => {
                console.log(testing.output())
            })
            .prompt('hello', testing => {
                console.log(testing.output())
            })
            .prompt('hey', testing => {
                console.log(testing.output())
            })
            .end()
    })
})