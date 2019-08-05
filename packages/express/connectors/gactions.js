const gactions = require('actions-on-google')
const _ = require('lodash')
const Session = require('newbot-formats/session/gactions')
const output = require('../output')

module.exports = function ({
    app,
    converse,
    settings
}) {
    const propClientId = 'platforms.gactions.signin.clientId'
    const clientId = _.get(settings, propClientId)

    const action = gactions.actionssdk({
        clientId
    })

    const handle = (conv, input, {
        type = 'exec',
        signin,
        userData
    } = {}) => {
        const _converse = global.converse || converse
        const session = new Session(gactions, conv)
        const userId = session.userId()
        const options = output(session, settings)

        if (type == 'exec') {
            return _converse.exec(input, userId, options)
        }

        return _converse.event(input, {
            profile: userData,
            signin
        }, userId, options)
    }

    const handleOption = (conv, params, option) => {
        return handle(conv, option)
    }

    const handleSignin = (conv, params, signin) => {
        const propName = 'platforms.gactions.signin.event'
        const eventName = _.get(settings, propName)
        if (!eventName) {
            throw '[Gactions] Please, add event name in "' + propName + '" property in "newbot.config.js"'
        }
        if (!clientId) {
            throw '[Gactions] Please, add client Id "' + propClientId + '" property in "newbot.config.js"'
        }
        return handle(conv, eventName, {
            type: 'event',
            signin,
            userData: conv.user.profile.payload
        })
    }

    action.intent('actions.intent.MAIN', handle)
    action.intent('actions.intent.TEXT', handle)
    action.intent('actions.intent.OPTION', handleOption)
    action.intent('actions.intent.SIGN_IN', handleSignin)

    app.post(settings.path || '/gactions', action)
}
