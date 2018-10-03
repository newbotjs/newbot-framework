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

    if (Utils.isWebSite(session) || Utils.isGactions(session)) {
        if (card.buttons) {
            card.buttons = card.buttons.map(b => mapButton(b))
        }
        return card
    }

    if (Utils.isBottenderViber(session)) {
        let url = ''
        let buttons = []
        let sizeButtons = 0
        if (card.buttons) {
            const firstButton = card.buttons[0]
            if (firstButton.url) url = firstButton.url
            sizeButtons = card.buttons.length
            buttons = card.buttons.map(b => {
                b = mapButton(b)
                let type, text
                switch (b.type) {
                    case 'url':
                    case 'web_url':
                        type = 'open-url'
                        text = b.title
                        break
                    case 'postback':
                        type = 'reply'
                        text = b.msg || b.title
                        break
                    default:
                        break;
                }
                return {
                    Columns: 6,
                    Rows: 1,
                    ActionType: type,
                    ActionBody: b.url || url,
                    Text: text
                }
            })
        }
        return _.flatten([{
                Columns: 6,
                Rows: 3 - (sizeButtons == 3 ? 1 : 0),
                ActionType: 'open-url',
                ActionBody: url,
                Image: card.image
            },
            {
                Columns: 6,
                Rows: 2,
                ActionType: 'open-url',
                ActionBody: url,
                Text: `<font color=#323232><b>${card.title}</b></font>
                <font color=#777777><br>${card.subtitle}</font>`,
                TextSize: "medium",
                TextVAlign: "middle",
                TextHAlign: "left"
            },
            ...buttons
        ])
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
