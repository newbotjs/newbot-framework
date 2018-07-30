const builder = require('botbuilder')
const mainSkill = require('../index')
const { ConverseTesting } = require('newbot/testing')

module.exports = () => {
    const converse = new ConverseTesting(mainSkill('en_EN'))
    converse.testingWrapper((input, testingExec) => {
        connector = new builder.ConsoleConnector()
        bot = new builder.UniversalBot(connector, (session) => {
            const { text } = session.message
            testingExec(text, { data: { session } })
        })
        connector.processMessage(input)
    })
    return converse
}