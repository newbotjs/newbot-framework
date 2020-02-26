const AlexaSession = require('./platforms/alexa')
const BottenderSession = require('./platforms/bottender')
const GactionsSession = require('./platforms/gactions')
const DiscordSession = require('./platforms/discord')
const MsBotSession = require('./platforms/msbot')
const { TwitterSession, CRCToken} = require('./platforms/twitter')

module.exports = {
    AlexaSession,
    BottenderSession,
    GactionsSession,
    DiscordSession,
    TwitterSession,
    TwitterCRCToken: CRCToken,
    MsBotSession
}