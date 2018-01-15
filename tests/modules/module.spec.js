const assert = require('assert')
const { ConverseTesting } = require('../../index')

describe('Module Test', () => {
    let converse, user

    beforeEach((done) => {
        converse = new ConverseTesting(done)
        converse.code(`
            @Event('start')
            start() {
                a = 1
                child.lazy(a)
                > Ok
                > { child.jsFunction() }
            }

            @Event('on', 'parent')
            event() {
                > event works
            }
        `)
        user = converse.createUser()
    })

    it('module test', () => {
        return user
            .start(testing => {
               assert.deepEqual(testing.output(), ['Lazy 1'])
            })
            .prompt('test', testing => {
                assert.deepEqual(testing.output(), ['Lazy 2', 'Lazy 3'])
            })
            .prompt('test2', testing => {
                assert.deepEqual(testing.output(), ['Lazy 4', 'Ok', 'js'])
            })
            .end()
    })

    it('module event', () => {
        return user
            .event('parent', testing => {
               assert.equal(testing.output(0), ['event works'])
            })
            .end()
    })
   
})