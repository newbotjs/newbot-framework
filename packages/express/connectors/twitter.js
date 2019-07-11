const {
    TwitterSession,
    CRCToken
} = require('newbot-formats/session/twitter')

module.exports = function ({
    app,
    settings,
    converse
}) {
    app.get(settings.path || '/twitter', (req, res) => {
        try {
            res.status(200).send(CRCToken(settings, req.query))
        } catch (err) {
            res.status(400).send(err.message)
        }
    })

    app.post(settings.path || '/twitter', async (req, res) => {
        const session = new TwitterSession(settings, req.body)
        const _converse = global.converse || converse

        if (session.userId) {
            await _converse.exec(session.text, session.userId, {
                async output(str, next) {
                    await session.send(str)
                    next()
                },
                data: {
                    session
                }
            })
        }

        res.status(204).end()
    })
}
