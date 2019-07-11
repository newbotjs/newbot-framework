const {
    ChatConnector,
    UniversalBot
} = require('botbuilder')

module.exports = ({settings, app, converse}) => {
    const connector = new ChatConnector()
    new UniversalBot(connector, (session) => {
        const _converse = global.converse || converse
        const {
            text,
            user
        } = session.message
        _converse.exec(text, user.id, {
            output(msg, next) {
                session.send(msg)
                next()
            },
            data: {
                session
            }
        }).catch(err => console.log(err))
    })

    app.post(settings.path || '/botframework', connector.listen())
}