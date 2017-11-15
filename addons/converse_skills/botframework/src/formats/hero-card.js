const builder = require('botbuilder')
const { isFacebook } = require('../utils')

function heroCard(session, card) {
    if (isFacebook(session)) {
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
            element.buttons = card.buttons.map(b => {
                if (!b.type) b.type = 'web_url'
                switch (b.type) {
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
                    case 'webview':
                        return {
                            type: "web_url",
                            url: b.url,
                            title: b.title,
                            webview_height_ratio: 'full',
                            messenger_extensions: true
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
                if (!b.url) {
                    return null
                }
                return builder.CardAction.openUrl(session, b.url, b.title)
            }).filter(b => b)
            heroCard.buttons(card[p])
        }
        if (card[p] && p === 'image') {
            heroCard.images([
                builder.CardImage.create(session, card[p])
            ])
        }
        else if (card[p]) heroCard[p](card[p])
    })
    return heroCard
}

module.exports = {
    heroCard
}