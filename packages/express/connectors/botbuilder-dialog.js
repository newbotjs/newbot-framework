const {
    ChatConnector,
    UniversalBot
} = require('botbuilder')
const output = require('../output')

const connector = new ChatConnector()
const bot = new UniversalBot(connector)

let settings, converse

bot.dialog('/', async (session, args = {}) => {
    const {
        event
    } = args
    const _converse = global.converse || converse
    const {
        text,
        user
    } = session.message

    const options = output(session, settings)

    if (event) {
        _converse.event(event.name, event.data, user.id, options).catch(console.log)
    } else {
        _converse.exec(text, user.id, options).catch(console.log)
    }
})

module.exports = {
    init(_settings, _converse) {
        settings = _settings
        converse = _converse
    },
    bot,
    connector
}
