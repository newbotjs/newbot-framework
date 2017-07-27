const builder = require('botbuilder')
const assert = require('assert')
const { Converse } = require('../../../index')
const converseLibrary = require('../src/library')

describe('Bot framework Test', () => {

    let connector, bot, converse

    beforeEach(() => {
        converse = new Converse()
            .code(`
                @Event('start')
                start() {
                    > 'hey'
                }
            `)
        connector = new builder.ConsoleConnector()
        bot = new builder.UniversalBot(connector, (session) => {
            converseLibrary.exec(session)
        })
        bot.library(converseLibrary(converse))
    })

    it('Simple Response Test', (done) => {
        bot.on('send', (message) => {
            const { text } = message
            assert.equal(text, 'hey')
            done()
        })
        connector.processMessage('hello')
    })

})