const _ = require('lodash')
const Session = require('newbot-formats/session/alexa')
const output = require('../../output')
const handlers = require('./handlers')

module.exports = function ({
    app,
    settings,
    converse
}) {
    const exec = (handlerInput, eventName, eventData = {}) => {
        const session = new Session(handlerInput)
        const {
            id: userId
        } = session.user
        const text = _.get(handlerInput.requestEnvelope, 'request.intent.slots.any.value')
        const _converse = global.converse || converse
        const _settings = output(session, settings)
        let p
        if (eventName) {
            p = _converse.event(eventName, eventData, [userId], _settings)
        }
        else {
            p = _converse.exec(text, userId, _settings)
        }
        return p.then(() => session.response)
    }

    const adapter = handlers(exec)

    app.post(settings.path || 'alexa', adapter.getRequestHandlers())
}
