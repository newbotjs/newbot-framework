const builder = require('botbuilder')
const Utils = require('../utils')
const {
    heroCard
} = require('./hero-card')
const {
    quickReplies
} = require('./quick-replies')
const _ = require('lodash')

module.exports = (text, [cards, actions], {
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

    if (Utils.isGactions(session)) {
        return [
            text,
            {
                method: 'Carousel',
                items: [
                    // todo
                ]
            }
        ]
    }

    if (Utils.isBottenderViber(session)) {
        return {
            method: 'sendCarouselContent',
            params: [{
                Type: 'rich_media',
                ButtonsGroupColumns: 6,
                ButtonsGroupRows: 7,
                Buttons: _.flatten(cards)
            }]
        }
    }

    if (Utils.isBottenderLine(session)) {
        return {
            method: 'replyCarouselTemplate',
            params: [text, cards]
        }
    }

    if (Utils.isBottenderFacebook(session)) {
        return [
            text,
            {
                method: 'sendGenericTemplate',
                params: [cards]
            }
        ]
    }

    if (Utils.isFacebook(session)) {
        return facebook
    }

    if (Utils.isBotBuilder(session)) {
        return new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .suggestedActions(builder.SuggestedActions.create(session, actions))
            .attachments(cards)
    }

    return text
}
