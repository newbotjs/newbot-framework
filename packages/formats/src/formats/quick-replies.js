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

    actions = actions.map(action => {
        return builder.CardAction.imBack(session, action, action)
    })

    return actions
}

module.exports = {
    quickReplies,
    format(text, [actions], { session }) {

        actions = quickReplies(session, actions)

        if (Utils.isWebSite(session)) {
            return { text, actions }
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
        else if (Utils.isFacebook(session)) {
            return facebook
        }

        return new builder.Message(session)
            .text(text)
            .suggestedActions(builder.SuggestedActions.create(session, actions))
    }
}