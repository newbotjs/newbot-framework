const builder = require('botbuilder')
const Utils = require('../utils')
const {
    heroCard
} = require('./hero-card')

function buttons(session, text, buttons, user) {
    const card = heroCard(session, {
        buttons
    }, user)

    if (Utils.isWebSite(session)) {
        return {
            text,
            buttons
        }
    }

    if (Utils.isGactions(session)) {
        return [
            text,
            ...card.buttons.map(b => {
                let method, param
                switch (b.type) {
                    case 'postback':
                        method = 'Suggestions'
                        param = b.msg || b.title
                        break
                    case 'url':
                    case 'web_url':
                        method = 'LinkOutSuggestion'
                        param = {
                            name: b.title,
                            url: b.url
                        }
                        break
                }
                return {
                    method,
                    params: [param]
                }
            })
        ]
    }

    if (Utils.isTwitter(session)) {
        return {
            text,
            ctas: card.buttons
        }
    }

    const facebook = {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'button',
                text,
                buttons: card.buttons
            }
        }
    }

    if (Utils.isBotBuilderFacebook(session)) {
        return new builder.Message(session)
            .sourceEvent({
                facebook
            })
    }

    if (Utils.isBottenderFacebook(session)) {
        return {
            method: 'sendButtonTemplate',
            params: [
                text,
                card.buttons
            ]
        }
    }

    if (Utils.isBottenderTelegram(session)) {
        return {
            method: 'sendMessage',
            params: [
                text,
                {
                    reply_markup: JSON.stringify({
                        inline_keyboard: card.buttons
                    })
                }
            ]
        }
    }

    if (Utils.isFacebook(session)) {
        return facebook
    }

    if (Utils.isBotBuilder(session)) {
        return new builder.Message(session)
            .text(text)
            .addAttachment(card)
    }

    return text
}

module.exports = {
    buttons,
    format(text, [_buttons], {
        session
    }, user) {
        return buttons(session, text, _buttons, user)
    }
}
