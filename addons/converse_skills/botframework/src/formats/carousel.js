const builder = require('botbuilder')
const { isFacebook } = require('../utils')
const { heroCard } = require('./hero-card')
const _ = require('lodash')

module.exports = (converse) => {
    converse.format('carousel', (text, [cards], { session }) => {
        if (!_.isArray(cards)) {
            return text
        }
        cards = cards.map(card => {
            return heroCard(session, card)
        }).slice(0, 10)
        if (isFacebook(session)) {
            return new builder.Message(session)
                .sourceEvent({
                    facebook: {
                        attachment: {
                            type: "template",
                            payload: {
                                template_type: "generic",
                                elements: cards
                            }
                        }
                    }
                })
        }
        return new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards)
    })
}