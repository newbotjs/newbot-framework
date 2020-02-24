const _ = require('lodash')
const { DiscordSession } = require('newbot-sessions')
const output = require('../../output')

module.exports = function ({
    app,
    settings,
    converse
}) {
    const client = new Discord.Client()

    client.on('message', msg => {
        const _converse = global.converse || converse
        const session = new DiscordSession(msg)
        _converse.exec(msg.content, output(session, settings))
    })

    client.login(settings.accessToken)
}
