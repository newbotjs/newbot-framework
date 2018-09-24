const builder = require('botbuilder')
const Utils = require('../utils')

module.exports = (text, params, {
    session
}) => {
    if (Utils.isFacebook(session) && !Utils.isBotBuilderFacebook(session)) {
        return {
            text
        }
    }

    if (Utils.isWebSite(session)) {
        return {
            text,
            markdown: true
        }
    }
    
    if (Utils.isBotBuilder(session)) {
        return new builder.Message(session)
            .text(text)
            .textFormat('markdown')
    }
    return text
}
