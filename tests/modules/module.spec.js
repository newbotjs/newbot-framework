const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('Module Test', () => {
    let converse, user

    before(() => {
        converse = new ConverseTesting()
        converse.code(`
            @Event('start')
            start() {
                a = 1
                child.lazy(a)
                > Ok
            }
        `)
        converse.skill('child')
        user = converse.createUser()
    })

    it('module test', () => {
        user
            .start(testing => {
               assert.deepEqual(testing.output(), ['Lazy 1'])
            })
            .prompt('test', testing => {
                assert.deepEqual(testing.output(), ['Lazy 2', 'Lazy 3'])
            })
            .prompt('test2', testing => {
                assert.deepEqual(testing.output(), ['Lazy 4', 'Ok'])
            })
            .end()
    })
})