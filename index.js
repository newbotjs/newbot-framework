const Converse = require('./src/converse')
const ConverseTesting = require('./src/testing/converse-testing')

/*process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason)
})*/

module.exports = { Converse, NewBot: Converse, ConverseTesting }



