const builder = require('botbuilder')
const { ConverseTesting } = require('../../../../index')

module.exports = () => {
    const converse = new ConverseTesting()
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