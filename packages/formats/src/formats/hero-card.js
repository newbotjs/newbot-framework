const builder = require('botbuilder')
const _ = require('lodash')
const Utils = require('../utils')

function heroCard(session, card, user) {

    const mapButton = (b) => {
        b = Utils.toByLang(b, user)
        if (b.event) {
            b.type = 'webview'
            b.url = 'https://example.com'
        }
        if (!b.type && !b.url) b.type = 'postback'
        else if (!b.type) b.type = 'web_url'
        return b
    }

    card = Utils.toByLang(card, user)

    if (Utils.isWebSite(session)) {
        if (card.buttons) {
            card.buttons = card.buttons.map(b => Utils.toByLang(b, user))
        }
        return card
    }

    if (Utils.isBottenderViber(session)) {
        const element = {
            Columns: 6,
            Rows: 2,
            Text: `<font color=#323232><b>${card.title}</b></font>
            <font color=#777777><br>${card.subtitle}</font>`,
            Image: card.image
        }
        if (card.buttons) {

        }
        /* if (!b.type && !b.url) element.ActionType = 'none'
         else if (!b.type) b.type = 'web_url'*/
        return element
    }

    if (Utils.isBottenderLine(session)) {
        const element = {
            thumbnailImageUrl: card.image,
            title: card.title,
            text: card.subtitle
        }
        if (card.buttons) {
            element.actions = card.buttons
                .filter(b => b)
                .map(b => {
                    b = mapButton(b)
                    switch (b.type) {
                        case 'url':
                        case 'web_url':
                            return {
                                type: 'uri',
                                uri: b.url,
                                label: b.title
                            }
                        case 'postback':
                            return {
                                type: 'postback',
                                label: b.title,
                                data: b.msg || b.title
                            }
                        default:
                            break;
                    }
                })
        }
        return element
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
                    b = mapButton(b)
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

    if (Utils.isBotBuilder(session)) {
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
            } else if (card[p] && p === 'image') {
                heroCard.images([
                    builder.CardImage.create(session, card[p])
                ])
                return
            } else if (card[p]) heroCard[p](card[p])
        })
        return heroCard
    }

    return card
}

module.exports = {
    heroCard
}
