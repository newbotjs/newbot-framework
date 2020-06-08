const builder = require('botbuilder')
const Utils = require('../utils')
const _ = require('lodash')
const browser = require('../../browser')
const querystring = require('querystring')

function quickReplies(session, actions, user) {

    if (!actions) return

    const getToLang = action => Utils.toByLang(action, user)

    if (Utils.isWebSite(session)) {
        return actions.map(getToLang)
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
            action = getToLang(action)
            if (!action.type) action.type = 'text'
            if (action.action) {
                action.payload = `action?${querystring.stringify(action.action)}`
            }
            if (!action.payload) {
                action.payload = action.text
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
            action = getToLang(action)
            return builder.CardAction.imBack(session, action, action)
        })
    }

    /*if (Utils.isBottenderSlack(session)) {
        return actions
    }*/

    if (Utils.isBottenderLine(session)) {
        return actions.map(action => {
            if (_.isString(action)) {
                return {
                    type: 'action',
                    action: {
                        type: 'message',
                        label: action
                    }
                }
            }
            action = getToLang(action)
            if (!action.type) action.type = 'message'
            if (action.action) {
                action.payload = `action?${querystring.stringify(action.action)}`
            }
            return {
                type: 'action',
                action: {
                    type: action.type,
                    label: action.text,
                    text: action.payload
                }
            }
        })
    }

    if (Utils.isBottenderTelegram(session)) {
        return actions.map(action => {
            if (_.isString(action)) {
                return {
                    text: action
                }
            }
            action = getToLang(action)
            return [{
                text: action.text
            }]
        })
    }

    if (Utils.isTwitter(session)) {
        return actions.map(action => {
            if (_.isString(action)) {
                return {
                    label: action
                }
            }
            action = getToLang(action)
            return {
                label: action.text,
                metadata: action.payload
            }
        })
    }

    const inline = actions.map(action => {
        action = getToLang(action)
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
    }, user) {

        actions = quickReplies(session, [actions], user)

        if (Utils.isWebSite(session)) {
            return browser.formats.quickReplies(text, actions)
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

        if (Utils.isBottenderLine(session)) {
            return {
                method: 'replyText',
                params: [
                    text,
                    {
                        items: actions
                    }
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
                            keyboard: actions,
                            one_time_keyboard: true
                        })
                    }
                ]
            }
        }

        if (Utils.isBotBuilder(session)) {
            return new builder.Message(session)
                .text(text)
                .suggestedActions(builder.SuggestedActions.create(session, actions))
        }

        return `${text} (${actions.reduce((a, b) => a + ', ' + b)})`
    }
}
