require('./src/transpiler/load')

const ConverseTesting = require('./src/testing/converse-testing')
const bot = require('./src/testing/conversation/bot')
const user = require('./src/testing/conversation/user')

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason)
})

module.exports = { ConverseTesting, bot, user }