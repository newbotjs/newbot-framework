const builder = require('botbuilder')

module.exports = (converse) => {
    converse.format('gif', (text, [url], { session }) => {
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