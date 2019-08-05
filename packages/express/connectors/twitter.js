const {
    TwitterSession,
    CRCToken
} = require('newbot-formats/session/twitter')
const _ = require('lodash')
const output = require('../output')

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
            await _converse.exec(session.text, session.userId, output(session, settings))
        }

        res.status(204).end()
    })
}
