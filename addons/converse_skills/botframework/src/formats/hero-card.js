const builder = require('botbuilder')
const _ = require('lodash')
const Utils = require('../utils')

function heroCard(session, card, user) {

    card = Utils.toByLang(card, user)

    if (Utils.isWebSite(session)) {
        if (card.buttons) {
            card.buttons = card.buttons.map(b => Utils.toByLang(b, user))
        }
        return card
    }

    if (Utils.isFacebook(session)) {
        const element = {
            title: _.truncate(card.title || '(empty)', {
                length: 75,
            }),
            subtitle: _.truncate(card.subtitle, {
                length: 75,
            }),
            image_url: card.image
        }
        if (card.buttons) {
            element.buttons = card.buttons
                .filter(b => b)
                .map(b => {
                    b = Utils.toByLang(b, user)
                    if (b.event) {
                        b.type = 'webview'
                        b.url = 'https://example.com'
                    }
                    if (!b.type && !b.url) b.type = 'postback'
                    else if (!b.type) b.type = 'web_url'
                    switch (b.type) {
                        case 'url':
                        case 'web_url':
                            return {
                                type: "web_url",
                                url: b.url,
                                title: b.title
                            }
                        case 'share':
                            return {
                                type: 'element_share'
                            }
                        case 'postback':
                            return {
                                type: 'postback',
                                title: b.title,
                                payload: b.msg || b.title
                            }
                        case 'webview':
                            return {
                                type: "web_url",
                                url: b.url,
                                title: b.title,
                                webview_height_ratio: 'full',
                                messenger_extensions: true
                            }
                        case 'phone':
                            return {
                                type: 'phone_number',
                                title: b.title,
                                payload: b.phone_number
                            }
                        default:
                            break
                    }
                })
        }
        return element
    }
    const heroCard = new builder.HeroCard(session);
    ['title', 'subtitle', 'text', 'image', 'buttons'].forEach(p => {
        if (card[p] && p === 'buttons') {
            card[p] = card[p].map(b => {
                b = Utils.toByLang(b, user)
                if (!b.url) {
                    return builder.CardAction.imBack(session, b.msg || b.title, b.title)
                }
                return builder.CardAction.openUrl(session, b.url, b.title)
            })
            heroCard.buttons(card[p])
            return
        }
        else if (card[p] && p === 'image') {
            heroCard.images([
                builder.CardImage.create(session, card[p])
            ])
            return
        }
        else if (card[p]) heroCard[p](card[p])
    })
    return heroCard
}

module.exports = {
    heroCard
}