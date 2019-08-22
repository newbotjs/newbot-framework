const alexa = require("alexa-app")
const _ = require('lodash')
const Session = require('newbot-formats/session/alexa')
const output = require('../output')

module.exports = function ({
    app,
    settings,
    converse
}) {
    const isProd = process.env.NODE_ENV == 'production'
    const alexaApp = new alexa.app(settings.path || 'alexa')

    alexaApp.express({
        expressApp: app,
        checkCert: isProd
    })

    const exec = (req, res, eventName) => {
        try {
            const session = new Session(req, res)
            const {
                userId
            } = req.data.session
            const text = req.slot('any')
            const _converse = global.converse || converse
            const _settings = output(session, settings)
            if (eventName) {
                return _converse.event(eventName, [userId], _settings)
            }
            return _converse.exec(text, userId, _settings)
        } catch (err) {
            console.log(err)
        }
    }

    const launch = (req, res) => {
        return exec(req, res, 'start')
    }

    alexaApp.pre = (req, res, type) => {
        try {
            const name = _.get(req, 'data.request.intent.name')
            if (name && /^AMAZON/.test(name)) {
                req.eventName = name
                _.set(req, 'data.request.intent.name', 'NewBotEvent')
                return 
            }
        } catch (err) {
            console.log(err)
        }
    }

    alexaApp.launch(launch)
    alexaApp.intent("NewBotIntent", exec)
    alexaApp.intent("NewBotEvent", (req, res) => {
        return exec(req, res, req.eventName)
    })
}
