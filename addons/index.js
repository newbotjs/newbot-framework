const assert = require('assert')
const { ConverseTesting } = require('../index')
const BotFrameworkTesting = require('./converse_skills/botframework/tests')

describe('Module Test', () => {
    let converse, user

    before(() => {
        converse = BotFrameworkTesting()
        converse.code(`@Event('start')
        start() {
            @Format('quickReplies', ['test'])
            > hello
        }`)
        user = converse.createUser()
    })

    it('module test', () => {
        user
            .start(testing => {
               console.log(testing.output())
            })
            .end()
    })
})