const {
    ChatConnector,
    UniversalBot
} = require('botbuilder')
const _ = require('lodash')

module.exports = ({
    settings,
    app,
    converse
}) => {
    const connector = new ChatConnector()
    new UniversalBot(connector, (session) => {
        const _converse = global.converse || converse
        const {
            text,
            user
        } = session.message
        _converse.exec(text, user.id, _.merge({
            output(msg, next) {
                session.send(msg)
                next()
            },
            data: {
                session
            }
        }, settings.output)).catch(err => console.log(err))
    })

    app.post(settings.path || '/botframework', connector.listen())
}
