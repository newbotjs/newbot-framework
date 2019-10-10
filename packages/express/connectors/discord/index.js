const _ = require('lodash')
const Session = require('newbot-formats/session/discord')
const output = require('../../output')
const handlers = require('./handlers')

module.exports = function ({
    app,
    settings,
    converse
}) {
    const client = new Discord.Client()

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`)
    });

    client.on('message', msg => {
        
    })

    client.login(settings.accessToken)
}
