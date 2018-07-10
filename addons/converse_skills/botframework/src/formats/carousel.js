const builder = require('botbuilder')
const Utils = require('../utils')
const {
    heroCard
} = require('./hero-card')
const {
    quickReplies
} = require('./quick-replies')
const _ = require('lodash')

module.exports = (converse) => {
    converse.format('carousel', (text, [cards, actions], {
        session
    }, user) => {

        actions = quickReplies(session, actions)

        if (!_.isArray(cards)) {
            return text
        }

        cards = cards.map(card => {
            return heroCard(session, card, user)
        }).slice(0, 10)

        if (Utils.isWebSite(session)) {
            return {
                text,
                cards,
                actions
            }
        }

        const facebook = {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: cards
                }
            },
            quick_replies: actions
        }

        if (Utils.isBotBuilderFacebook(session)) {
            return new builder.Message(session)
                .sourceEvent({
                    facebook
                })
        }
        else if (Utils.isFacebook(session)) {
            return facebook
        }

        return new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .suggestedActions(builder.SuggestedActions.create(session, actions))
            .attachments(cards)
    })
}
