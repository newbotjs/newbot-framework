const builder = require('botbuilder')
const Utils = require('../utils')

module.exports = (text, [url], {
    session
}) => {
    if (Utils.isWebSite(session)) {
        return {
            text,
            image
        }
    }
    if (Utils.isBotBuilder(session)) {
        return new builder.Message(session)
            .attachments([
                new builder.AnimationCard(session)
                .text(text)
                .media([{
                    url
                }])
            ])
    }
    return text
}
