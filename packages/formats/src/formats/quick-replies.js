const builder = require('botbuilder')
const Utils = require('../utils')
const _ = require('lodash')
const querystring = require('querystring')

function quickReplies(session, actions) {

    if (!actions) return

    if (Utils.isWebSite(session)) {
        return actions
    }

    if (Utils.isFacebook(session)) {
        actions = actions.map(action => {
            if (_.isString(action)) {
                return {
                    content_type: 'text',
                    title: action,
                    payload: action
                }
            }
            if (!action.type) action.type = 'text'
            if (action.action) {
                action.payload = `action?${querystring.stringify(action.action)}`
            }
            return {
                content_type: action.type,
                title: action.text,
                payload: action.payload,
                image_url: action.image
            }
        })
        return actions
    }

    if (Utils.isBotBuilder(session)) {
        return actions.map(action => {
            return builder.CardAction.imBack(session, action, action)
        })
    }

    if (Utils.isTwitter(session)) {
        return actions.map(action => {
            if (_.isString(action)) {
                return {
                    label: action
                }
            }
            return {
                label: action.text,
                metadata: action.payload
            }
        })
    }

    const inline = actions.map(action => {
        if (!_.isString(action)) {
            return action.text
        }
        return action
    })

    if (Utils.isGactions(session)) {
        return {
            method: 'Suggestions',
            params: inline
        }
    }

    return inline
}

module.exports = {
    quickReplies,
    format(text, [actions], {
        session
    }) {

        actions = quickReplies(session, actions)

        if (Utils.isWebSite(session)) {
            return {
                text,
                actions
            }
        }

        if (Utils.isGactions(session)) {
            return [text, actions]
        }

        if (Utils.isTwitter(session)) {
            return {
                text,
                quick_reply: {
                    type: 'options',
                    options: actions
                }
            }
        }

        const facebook = {
            text,
            quick_replies: actions
        }

        if (Utils.isBotBuilderFacebook(session)) {
            return new builder.Message(session)
                .sourceEvent({
                    facebook
                })
        }

        if (Utils.isBottenderFacebook(session)) {
            return {
                method: 'sendText',
                params: [
                    text,
                    {
                        quick_replies: actions
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
                .suggestedActions(builder.SuggestedActions.create(session, actions))
        }

        return `${text} (${actions.reduce((a, b) => a + ', ' + b)})`
    }
}
