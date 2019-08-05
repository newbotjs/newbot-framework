const {
    MessengerBot,
    ViberBot,
    TelegramBot,
    LineBot,
    SlackBot,
    MessengerHandler
} = require('bottender')
const { registerRoutes } = require('bottender/express')
const Session = require('newbot-formats/session/bottender')
const output = require('../output')
const _ = require('lodash')

module.exports = ({
    app,
    settings,
    converse,
    platform
}) => {

    const event = async context => {
        const {
            text,
            isText
        } = context.event
        if (!isText) return
        const _converse = global.converse || converse
        const session = new Session(context)
        await _converse.exec(text, context.session.user.id, output(session, settings))
    }

    const handler = new MessengerHandler()
        .onEvent(event)
        .onError(console.log)

    if (!settings.accessToken) return

    if (platform == 'messenger') {
        const messengerBot = new MessengerBot(settings).onEvent(handler)
        registerRoutes(app, messengerBot, {
            path: settings.path || '/messenger',
            verifyToken: settings.verifyToken
        })
    }
    
    else if (platform == 'viber') {
        const viberBot = new ViberBot(settings).onEvent(handler)
        registerRoutes(app, viberBot, {
            path: settings.path || '/viber'
        })
    }

    else if (platform == 'telegram') {
        const telegramBot = new TelegramBot(settings).onEvent(handler)
        registerRoutes(app, telegramBot, {
            path: settings.path || '/telegram'
        })
    }

    else if (platform == 'line') {
        const lineBot = new LineBot(settings).onEvent(handler)
        registerRoutes(app, lineBot, {
            path: settings.path || '/line'
        })
    }

    else if (platform == 'slack') {
        const slackBot = new SlackBot(settings).onEvent(handler)
        registerRoutes(app, slackBot, {
            path: settings.path || '/slack'
        })
    }

}
