const builder = require('botbuilder')
const Utils = require('../utils')

module.exports = (converse) => {
    converse.format('gif', (text, [url], { session }) => {
        if (Utils.isWebSite(session)) {
            return {
                text, 
                image
            }
        }
        return new builder.Message(session)
            .attachments([
                new builder.AnimationCard(session)
                    .text(text)
                    .media([
                        { url }
                    ])
            ])
    })    
}