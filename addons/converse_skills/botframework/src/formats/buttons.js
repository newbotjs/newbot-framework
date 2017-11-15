const builder = require('botbuilder')
const { isFacebook } = require('../utils')
const { heroCard } = require('./hero-card')

function buttons(session, text, buttons) {
    const card = heroCard(session, {
        buttons
    })
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
        converse.format('buttons', (text, [_buttons], { session }) => {
            return buttons(session, text, _buttons)
        })        
    }
}