const builder = require('botbuilder')
const { isFacebook, isWebSite } = require('../utils')
const { heroCard } = require('./hero-card')

function buttons(session, text, buttons, user) {
    const card = heroCard(session, {
        buttons
    }, user)
    if (isWebSite(session)) {
        return {
            text,
            buttons
        }
    }
    if (isFacebook(session)) {
        return new builder.Message(session)
            .sourceEvent({
                facebook: {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'button',
                            text,
                            buttons: card.buttons
                        }
                    }
                }
            })
    }
    return new builder.Message(session)
        .text(text)
        .addAttachment(card)
}

module.exports = {
    buttons,
    format(converse) {
        converse.format('buttons', (text, [_buttons], { session }, user) => {
            return buttons(session, text, _buttons, user)
        })        
    }
}