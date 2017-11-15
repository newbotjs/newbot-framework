const assert = require('assert')
const BotFrameworkTesting = require('./index')
const entry = require('../src/entry')

describe('Module Test', () => {
    let converse, user

    beforeEach(() => {
        converse = BotFrameworkTesting()
        converse.code(`@Event('start')
        start() {
            @Format('quickReplies', ['test'])
            > hello
        }`)
        entry(converse)
        user = converse.createUser()
    })

    it('module test', () => {
        user
            .start(testing => {
                const { data } = testing.output(0)
                assert.equal(data.text, 'hello')
                assert.deepEqual(data.suggestedActions.actions, [{
                    type: 'imBack',
                    value: 'test',
                    title: 'test'
                }])
            })
            .end()
    })
})
